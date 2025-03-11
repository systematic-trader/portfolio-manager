import {
  array,
  assertReturn,
  boolean,
  coerce,
  type Guard,
  literal,
  number,
  optional,
  props,
  startsWith,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { EOL } from 'jsr:@std/fs'
import { Debug } from '../../utils/debug.ts'
import { ensureError } from '../../utils/error.ts'
import { Timeout } from '../../utils/timeout.ts'
import { WebSocketClient, WebSocketClientEventError } from '../websocket-client.ts'
import { InteractiveBrokersClient, type InteractiveBrokersClientOptions } from './client.ts'
import { StatusResponse } from './resources/iserver/auth/status.ts'
import { sanitize } from './sanitize.ts'
import { Accounts } from './types/record/accounts.ts'
import { type Ledger, LedgerEntry, LedgerMessage } from './types/record/ledger.ts'
import { type Order, OrderTypes } from './types/record/orders.ts'
import { Snapshot, SnapshotFields } from './types/record/snapshot.ts'

type Writable<T> = { -readonly [P in keyof T]: T[P] }

const debug = {
  open: Debug('ib-client:ws:open'),
  close: Debug('ib-client:ws:close'),
  error: Debug('ib-client:ws:error'),
  info: Debug('ib-client:ws:info'),
}

const Topic = {
  act: props({
    topic: literal('act'),
    args: Accounts,
  }),
  sts: props({
    topic: literal('sts'),
    args: union([
      props({
        authenticated: boolean(),
        competing: boolean(),
        connected: boolean(),
        serverName: string(),
        serverVersion: string(),
        username: string(),
      }),
      props({
        authenticated: literal(false),
      }),
    ]),
  }),
  system: union([
    props({
      topic: literal('system'),
      success: string(),
      isFT: boolean(),
      isPaper: boolean(),
    }),
    props({
      topic: literal('system'),
      hb: number(),
    }),
  ]),
  tic: union([
    props({
      topic: literal('tic'),
      alive: boolean(),
      id: string(),
      lastAccessed: number(),
    }),
    props({
      topic: literal('tic'),
      iserver: props({
        authStatus: StatusResponse,
      }),
    }),
    props({
      topic: literal('tic'),
      md: props({ error: literal('no bridge') }),
    }),
    props({
      topic: literal('tic'),
      hmds: props({ error: literal('no bridge') }),
    }),
  ]),
  smd: {
    STK: props(Object.fromEntries(
      Object.entries(
        Snapshot.STK.merge({
          topic: startsWith('smd+'),
        }).props,
      ).map(([key, value]) => {
        return [key, optional(value as Guard<unknown>)] as const
      }),
    )),
  },
  sor: props({
    topic: literal('sor'),
    args: optional(
      array(
        props({ acct: string(), orderId: number() }, { extendable: true }),
      ),
    ),
  }),
  sld: props({
    topic: startsWith('sld+'),
    result: optional(array(LedgerMessage)),
  }),
}

const FullOrderType = union(OrderTypes.map((guard) => guard.merge({ acct: string() })))

export interface InteractiveBrokersStreamOptions {
  readonly client: InteractiveBrokersClient<InteractiveBrokersClientOptions>
  readonly marketData: Record<string, ReadonlyArray<number>>
}

export interface InteractiveBrokersStream extends AsyncDisposable {
  readonly accounts: Accounts
  readonly ledger: Ledger
  readonly marketData: Record<string, ReadonlyMap<number, Record<string, unknown>>>
  readonly orders: ReadonlyMap<number, Order>
  readonly serviceTime: number

  dispose(): Promise<void>
}

export async function InteractiveBrokersStream(
  { client, ...options }: InteractiveBrokersStreamOptions,
): Promise<InteractiveBrokersStream> {
  const { accessToken, accountId } = InteractiveBrokersClient.CONFIG[client.type]

  let { accounts, ledger, marketData, orders } = await Promise.allSettled([
    client.iserver.accounts.get(),
    client.portfolio.account.ledger.get({ accountId }),
    loadMarketData(client, options.marketData),
    client.iserver.account.orders.get({ accountId }),
  ]).then(([accountsResult, ledgerResult, marketDataResult, ordersResult]) => {
    if (accountsResult.status === 'rejected') {
      throw accountsResult.reason
    }

    if (ledgerResult.status === 'rejected') {
      throw ledgerResult.reason
    }

    if (marketDataResult.status === 'rejected') {
      throw marketDataResult.reason
    }

    if (ordersResult.status === 'rejected') {
      throw ordersResult.reason
    }

    const ordersMap = new Map<number, Order>()

    if (ordersResult.value.orders !== undefined) {
      for (const order of ordersResult.value.orders) {
        ordersMap.set(order.orderId, order)
      }
    }

    return {
      accounts: accountsResult.value,
      ledger: ledgerResult.value as { [P in keyof Ledger]: Writable<Ledger[P]> },
      marketData: marketDataResult.value,
      orders: ordersMap,
    }
  })

  debug.info(accountId, 'ledger', ledger)

  const assetClassByConID = Object.entries(options.marketData).reduce(
    (map, [assetClass, conIDs]) => {
      for (const conID of conIDs) {
        map.set(conID, assetClass)
      }

      return map
    },
    new Map<number, string>(),
  )

  const websocketURL = new URL(InteractiveBrokersClient.CONFIG.websocketURL)

  websocketURL.searchParams.set('oauth_token', accessToken)

  const websocket = new WebSocketClient({ url: websocketURL })

  let serviceTime = Date.now()
  let caughtError: undefined | Error = undefined

  const stream = {
    async [Symbol.asyncDispose](): Promise<void> {
      pingRepeater.abort()
      heartbeatRepeater.abort()

      await Promise.allSettled([websocket.close(), pingRepeater, heartbeatRepeater])
    },

    async dispose(): Promise<void> {
      await stream[Symbol.asyncDispose]()

      if (caughtError !== undefined) {
        throw caughtError
      }
    },

    get accounts() {
      if (caughtError !== undefined) {
        throw caughtError
      }

      return accounts
    },

    get ledger() {
      if (caughtError !== undefined) {
        throw caughtError
      }

      return ledger
    },

    get marketData() {
      if (caughtError !== undefined) {
        throw caughtError
      }

      return marketData
    },

    get orders() {
      if (caughtError !== undefined) {
        throw caughtError
      }

      return orders
    },

    get serviceTime() {
      return serviceTime
    },
  }

  // IBKR recommend 60s
  const pingRepeater = Timeout.repeat(30_000, () => {
    if (websocket.state.status === 'open') {
      debug.info(accountId, 'ping sent')
      websocket.send('tic')
    }
  })

  const heartbeatRepeater = Timeout.repeat(5_000, async () => {
    if (Date.now() - serviceTime > 30_000) {
      serviceTime = Date.now()

      if (websocket.state.status === 'open') {
        debug.info(accountId, 'reconnecting - heartbeat timeout')

        await websocket.reconnect()
      }
    }
  })

  try {
    websocket.addListener('error', (event) => {
      const embeddedError = 'error' in event && typeof event.error === 'object' && event.error !== null
        ? ensureError(event.error)
        : new WebSocketClientEventError({ event: event, url: websocketURL.href })

      debug.error(accountId, embeddedError)

      if (caughtError === undefined) {
        caughtError = embeddedError
      }

      // Do NOT await the stream.dispose() here, as it will cause a deadlock
      stream.dispose()
    })

    let session = await client.session.ensureActiveSession()

    client.session.addListener('session', async (newSession) => {
      session = newSession

      if (websocket.state.status === 'open') {
        debug.info(accountId, 'reconnecting - session changed')

        await websocket.reconnect()
      }
    })

    // både manuel-hent og subscribe af orders, skal ske som det første

    websocket.addListener('open', () => {
      serviceTime = Date.now()

      websocket.send(JSON.stringify({ session: session.tickleSessionToken }))

      websocket.send('sor+{}')

      websocket.send(`sld+${accountId}+{}`)

      for (const [assetClass, contractIDs] of Object.entries(options.marketData)) {
        if (assetClass in SnapshotFields) {
          const fieldsValue = SnapshotFields[assetClass as keyof typeof SnapshotFields]

          if (fieldsValue === undefined) {
            continue
          }

          const fields = Object.keys(fieldsValue)

          if (fields.length === 0) {
            continue
          }

          for (const contractID of contractIDs) {
            const existingSnapshot = marketData[assetClass]?.get(contractID)

            if (existingSnapshot === undefined) {
              continue
            }

            const message = `smd+${contractID}+{"fields":${JSON.stringify(fields)}}`

            debug.info(accountId, `market data request for asset="STK" symbol="${existingSnapshot['55']}"`)

            websocket.send(message)
          }
        }
      }
    })

    websocket.addListener(
      'message',
      async (message) => {
        if (message.data instanceof Blob) {
          const payloadText = await message.data.text()
          const payload = parseJSON(payloadText)

          if (typeof payload === 'object' && payload !== null) {
            if ('topic' in payload && typeof payload.topic === 'string') {
              const [topic, target] = payload.topic.split('+')

              switch (topic) {
                case 'act': {
                  const data = parsePayload(Topic[topic], payload)

                  accounts = data.args

                  debug.info(accountId, 'accounts received')

                  return
                }

                case 'sts': {
                  const data = parsePayload(Topic[topic], payload)

                  if (data.args.authenticated === false || data.args.connected === false) {
                    debug.info(accountId, 'session reset due to authentication failure')

                    await client.session.reset({ liveSessionToken: session.liveSessionToken })
                    await client.session.ensureActiveSession()
                  }

                  return
                }

                case 'tic': {
                  const data = parsePayload(Topic[topic], payload)

                  if ('iserver' in data) {
                    if (
                      data.iserver.authStatus.authenticated === false || data.iserver.authStatus.connected === false
                    ) {
                      debug.info(accountId, 'session reset due to ping authentication failure')

                      await client.session.reset({ liveSessionToken: session.liveSessionToken })
                      await client.session.ensureActiveSession()
                    }

                    return
                  }

                  if ('alive' in data) {
                    if (data.alive) {
                      debug.info(accountId, 'ping response')
                    } else {
                      debug.info(accountId, 'session reset due to ping alive failure')

                      await client.session.reset({ liveSessionToken: session.liveSessionToken })
                      await client.session.ensureActiveSession()
                    }

                    return
                  }

                  if ('md' in data) {
                    debug.info(accountId, 'market data is not being currently requested (md=no bridge)')
                    return
                  }

                  if ('hmds' in data) {
                    debug.info(accountId, 'historical market data is not being currently requested (hmds=no bridge)')
                    return
                  }

                  throw new Error(`Unexpected message for topic "tic":${EOL}${payloadText}`)
                }

                case 'system': {
                  const data = parsePayload(Topic[topic], payload)

                  if ('success' in data) {
                    debug.info(accountId, 'session successfully established')
                    return
                  }

                  if ('hb' in data) {
                    serviceTime = data.hb
                    debug.info(
                      accountId,
                      `heartbeat received (service time=${new Date(data.hb).toISOString()})`,
                    )
                    return
                  }

                  throw new Error(`Unexpected message for topic "system":${EOL}${payloadText}`)
                }

                case 'sld': {
                  const data = parsePayload(Topic[topic], payload)

                  if (data.result === undefined) {
                    return
                  }

                  for (const message of data.result) {
                    const key = message.key.substring(10) as keyof typeof ledger

                    const existing = key in ledger ? ledger[key] : undefined

                    if (existing === undefined) {
                      const newEntry: Partial<LedgerEntry> = {
                        // acctcode: message.acctCode,
                        // cashbalance: message.cashbalance,
                        // cashbalancefxsegment: message.cashBalanceFXSegment,
                        // commoditymarketvalue: message.commodityMarketValue,
                        // corporatebondsmarketvalue: message.corporateBondsMarketValue,
                        // cryptocurrencyvalue: existing.cryptocurrencyvalue,
                        // currency: message.secondKey ?? existing.currency,
                        // dividends: message.dividends ?? existing.dividends,
                        // endofbundle: existing.endofbundle,
                        // exchangerate: message.exchangeRate ?? existing.exchangerate,
                        // funds: message.funds ?? existing.funds,
                        // futuremarketvalue: existing.futuremarketvalue,
                        // futureoptionmarketvalue: existing.futureoptionmarketvalue,
                        // futuresonlypnl: existing.futuresonlypnl,
                        // interest: message.interest ?? existing.interest,
                        // issueroptionsmarketvalue: message.issueOptionsMarketValue ?? existing.issueroptionsmarketvalue,
                        // key: message.key ?? existing.key,
                        // moneyfunds: message.moneyFunds ?? existing.moneyfunds,
                        // netliquidationvalue: message.netLiquidationValue ?? existing.netliquidationvalue,
                        // realizedpnl: message.realizedPnl ?? existing.realizedpnl,
                        // secondkey: message.secondKey ?? existing.secondkey,
                        // sessionid: existing.sessionid,
                        // settledcash: message.settledCash ?? existing.settledcash,
                        // severity: message.severity ?? existing.severity,
                        // stockmarketvalue: message.stockMarketValue ?? existing.stockmarketvalue,
                        // stockoptionmarketvalue: existing.stockoptionmarketvalue,
                        // tbillsmarketvalue: message.tBillsMarketValue ?? existing.tbillsmarketvalue,
                        // tbondsmarketvalue: message.tBondsMarketValue ?? existing.tbondsmarketvalue,
                        // timestamp: message.timestamp ?? existing.timestamp,
                        // unrealizedpnl: message.unrealizedPnl ?? existing.unrealizedpnl,
                        // warrantsmarketvalue: message.warrantsMarketValue ?? existing.warrantsmarketvalue,
                      }

                      ledger[key] = assertReturn(LedgerEntry, newEntry)
                      // TODO
                    } else {
                      const updatedEntry: LedgerEntry = {
                        acctcode: message.acctCode ?? existing.acctcode,
                        cashbalance: message.cashbalance ?? existing.cashbalance,
                        cashbalancefxsegment: message.cashBalanceFXSegment ?? existing.cashbalancefxsegment,
                        commoditymarketvalue: message.commodityMarketValue ?? existing.commoditymarketvalue,
                        corporatebondsmarketvalue: message.corporateBondsMarketValue ??
                          existing.corporatebondsmarketvalue,
                        cryptocurrencyvalue: existing.cryptocurrencyvalue,
                        currency: message.secondKey ?? existing.currency,
                        dividends: message.dividends ?? existing.dividends,
                        endofbundle: existing.endofbundle,
                        exchangerate: message.exchangeRate ?? existing.exchangerate,
                        funds: message.funds ?? existing.funds,
                        futuremarketvalue: existing.futuremarketvalue,
                        futureoptionmarketvalue: existing.futureoptionmarketvalue,
                        futuresonlypnl: existing.futuresonlypnl,
                        interest: message.interest ?? existing.interest,
                        issueroptionsmarketvalue: message.issueOptionsMarketValue ?? existing.issueroptionsmarketvalue,
                        key: message.key ?? existing.key,
                        moneyfunds: message.moneyFunds ?? existing.moneyfunds,
                        netliquidationvalue: message.netLiquidationValue ?? existing.netliquidationvalue,
                        realizedpnl: message.realizedPnl ?? existing.realizedpnl,
                        secondkey: message.secondKey ?? existing.secondkey,
                        sessionid: existing.sessionid,
                        settledcash: message.settledCash ?? existing.settledcash,
                        severity: message.severity ?? existing.severity,
                        stockmarketvalue: message.stockMarketValue ?? existing.stockmarketvalue,
                        stockoptionmarketvalue: existing.stockoptionmarketvalue,
                        tbillsmarketvalue: message.tBillsMarketValue ?? existing.tbillsmarketvalue,
                        tbondsmarketvalue: message.tBondsMarketValue ?? existing.tbondsmarketvalue,
                        timestamp: message.timestamp ?? existing.timestamp,
                        unrealizedpnl: message.unrealizedPnl ?? existing.unrealizedpnl,
                        warrantsmarketvalue: message.warrantsMarketValue ?? existing.warrantsmarketvalue,
                      }

                      ledger[key] = assertReturn(LedgerEntry, updatedEntry)
                    }

                    debug.info(accountId, `ledger data received for "${key}"`)
                  }

                  return
                }

                case 'smd': {
                  if (target === undefined || target.length === 0) {
                    throw new Error(`Unexpected message target for topic "${topic}":${EOL}${payloadText}`)
                  }

                  const conID = Number(target)

                  const expectedAssetClass = assetClassByConID.get(conID)

                  if (expectedAssetClass === undefined) {
                    throw new Error(`Unexpected contract ID for topic "${topic}":${EOL}${payloadText}`)
                  }

                  const guard = Topic[topic][expectedAssetClass as keyof typeof Topic[typeof topic]]

                  if (guard === undefined) {
                    throw new Error(`Unexpected asset class for topic "${topic}":${EOL}${payloadText}`)
                  }

                  const partialProps = parsePayload(guard, payload)

                  const existingSnapshot = marketData[expectedAssetClass]?.get(conID)

                  if (existingSnapshot === undefined) {
                    return
                  }

                  for (const key in partialProps) {
                    const value = partialProps[key]

                    if (value !== undefined) {
                      existingSnapshot[key] = partialProps[key]
                    }
                  }

                  debug.info(
                    accountId,
                    `market data received for asset="${expectedAssetClass}" symbol="${existingSnapshot['55']}"`,
                  )

                  return
                }

                case 'sor': {
                  debug.info(accountId, 'orders payload received:', payload)

                  const data = parsePayload(Topic[topic], payload)

                  if (data.args === undefined) {
                    return
                  }

                  for (const orderMessage of data.args) {
                    const existingOrder = orders.get(orderMessage.orderId)

                    if (existingOrder === undefined) {
                      const newOrder = assertReturn(FullOrderType, orderMessage)

                      orders.set(newOrder.orderId, newOrder)

                      debug.info(accountId, 'new order received')
                    } else {
                      const updatedOrder = assertReturn(FullOrderType, Object.assign({}, existingOrder, orderMessage))

                      orders.set(updatedOrder.orderId, updatedOrder)

                      debug.info(accountId, 'existing order updated')
                    }
                  }

                  return
                }

                default: {
                  throw new Error(`Unexpected message topic:${EOL}${payloadText}`)
                }
              }
            } else if (
              'message' in payload && typeof payload.message === 'string' && Object.keys(payload).length === 1
            ) {
              debug.info(accountId, payload.message)
              return
            }
          }

          throw new Error(`Unexpected message payload:${EOL}${payloadText}`)
        }

        throw new Error(`Unexpected message payload type: ${getType(message.data)}`)
      },
    )

    await websocket.connect()

    return stream
  } catch (error) {
    pingRepeater.abort()

    await Promise.allSettled([stream.dispose(), pingRepeater]).then((results) => {
      results.map((result) => {
        if (result.status === 'rejected') {
          throw result.reason
        }
      })
    })

    throw error
  }
}

function getType(value: unknown): string {
  if (typeof value === 'object') {
    if (value === null) {
      return 'null'
    } else if ('constructor' in value && typeof value === 'function') {
      return value.constructor.name
    } else {
      return 'object'
    }
  } else {
    return typeof value
  }
}

function parseJSON(payload: string): unknown {
  return sanitize(JSON.parse(payload))
}

function parsePayload<T>(guard: Guard<T>, payload: unknown): T {
  return assertReturn(guard, coerce(guard)(payload))
}

async function loadMarketData(
  client: InteractiveBrokersClient<InteractiveBrokersClientOptions>,
  marketData: Record<string, ReadonlyArray<number>>,
): Promise<Record<string, Map<number, Record<string, unknown>>>> {
  const map: Record<string, Map<number, Record<string, unknown>>> = {}

  await Promise.allSettled(
    Object.entries(marketData).map(async ([assetClass, conIDs]) => {
      const snapshots = await client.iserver.marketData.snapshot.getByAssetClass({
        assetClass: assetClass as keyof Snapshot,
        conIDs,
      })

      await Promise.allSettled(
        conIDs.map((conID) => client.iserver.marketData.snapshot.unsubscribe({ conID })),
      ).then((results) => {
        results.map((result) => {
          if (result.status === 'rejected') {
            throw result.reason
          }
        })
      })

      const assetMap = new Map<number, Record<string, unknown>>()

      for (const snapshot of snapshots) {
        assetMap.set(snapshot.conid, snapshot)
      }

      map[assetClass] = assetMap
    }),
  ).then((results) => {
    results.map((result) => {
      if (result.status === 'rejected') {
        throw result.reason
      }
    })
  })

  return map
}
