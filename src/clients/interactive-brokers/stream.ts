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
import type { Currency3OrBase } from './types/derived/currency.ts'
import { Accounts } from './types/record/accounts.ts'
import { LedgerMessage } from './types/record/ledger.ts'
import { Order } from './types/record/orders.ts'
import { Snapshot, SnapshotFields } from './types/record/snapshot.ts'

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
    result: optional(array(LedgerMessage.pick(['key', 'timestamp'], { extendable: true }))),
  }),
}

export interface InteractiveBrokersStreamOptions {
  readonly client: InteractiveBrokersClient<InteractiveBrokersClientOptions>
  readonly marketData: Record<string, ReadonlyArray<number>>
}

export interface InteractiveBrokersStream extends AsyncDisposable {
  readonly accounts: Accounts
  readonly ledger: Record<Currency3OrBase, undefined | LedgerMessage>
  readonly marketData: Record<string, ReadonlyMap<number, Record<string, unknown>>>
  readonly orders: ReadonlyMap<number, Order>
  readonly serviceTime: number

  dispose(): Promise<void>
}

export async function InteractiveBrokersStream(
  options: InteractiveBrokersStreamOptions,
): Promise<InteractiveBrokersStream> {
  const { accessToken, accountId } = InteractiveBrokersClient.CONFIG[options.client.type]

  let { accounts, ledger, marketData, orders } = await loadData(options)

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

  async function reconnect(): Promise<void> {
    try {
      await websocket.close()

      const updates = await loadData(options)

      accounts = updates.accounts
      ledger = updates.ledger
      marketData = updates.marketData
      orders = updates.orders

      await websocket.connect()
    } catch (error) {
      // Do NOT await the stream.dispose() here, as it will cause a deadlock
      stream.dispose()

      throw error
    }
  }

  // IBKR recommend 60s
  const pingRepeater = Timeout.repeat(30_000, () => {
    if (websocket.state.status === 'open') {
      debug.info(accountId, 'ping sent')
      websocket.send('tic')
    }
  })

  // IBKR says heartbeat should arrive every 10 seconds
  const heartbeatRepeater = Timeout.repeat(5_000, async () => {
    if (Date.now() - serviceTime > 30_000) {
      serviceTime = Date.now()

      if (websocket.state.status === 'open') {
        debug.info(accountId, 'reconnecting - heartbeat timeout')

        await reconnect()
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

    let session = await options.client.session.ensureActiveSession()

    options.client.session.addListener('session', async (newSession) => {
      session = newSession

      if (websocket.state.status === 'open') {
        debug.info(accountId, 'reconnecting - session changed')

        await reconnect()
      }
    })

    // både manual-hent og subscribe af orders, skal ske som det første

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

                    await options.client.session.reset({ liveSessionToken: session.liveSessionToken })
                    await options.client.session.ensureActiveSession()
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

                      await options.client.session.reset({ liveSessionToken: session.liveSessionToken })
                      await options.client.session.ensureActiveSession()
                    }

                    return
                  }

                  if ('alive' in data) {
                    if (data.alive) {
                      debug.info(accountId, 'ping response')
                    } else {
                      debug.info(accountId, 'session reset due to ping alive failure')

                      await options.client.session.reset({ liveSessionToken: session.liveSessionToken })
                      await options.client.session.ensureActiveSession()
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
                    const currency3OrBase = message.key.substring('LedgerList'.length) as Currency3OrBase

                    const existing = currency3OrBase in ledger ? ledger[currency3OrBase] : undefined

                    if (existing === undefined) {
                      ledger[currency3OrBase] = assertReturn(LedgerMessage, message)
                    } else {
                      ledger[currency3OrBase] = assertReturn(LedgerMessage, Object.assign({}, existing, message))
                    }

                    debug.info(accountId, `ledger data "${currency3OrBase}"`)
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
                    `market data asset="${expectedAssetClass}" symbol="${existingSnapshot['55']}"`,
                  )

                  return
                }

                case 'sor': {
                  const data = parsePayload(Topic[topic], payload)

                  if (data.args === undefined) {
                    return
                  }

                  for (const orderMessage of data.args) {
                    const existingOrder = orders.get(orderMessage.orderId)

                    if (existingOrder === undefined) {
                      const newOrder = assertReturn(Order, orderMessage)

                      orders.set(newOrder.orderId, newOrder)

                      debug.info(
                        accountId,
                        `order asset="${newOrder.secType}" description="${newOrder.description1}" status="${newOrder.status}"`,
                      )
                    } else {
                      const updatedOrder = assertReturn(Order, Object.assign({}, existingOrder, orderMessage))

                      orders.set(updatedOrder.orderId, updatedOrder)

                      debug.info(
                        accountId,
                        `order asset="${updatedOrder.secType}" description="${updatedOrder.description1}" status="${updatedOrder.status}"`,
                      )
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

type Writable<T> = { -readonly [P in keyof T]: T[P] }

async function loadData(options: InteractiveBrokersStreamOptions): Promise<{
  accounts: Accounts
  ledger: Record<Currency3OrBase, undefined | Writable<LedgerMessage>>
  marketData: Record<string, ReadonlyMap<number, Record<string, unknown>>>
  orders: Map<number, Order>
}> {
  return await Promise.allSettled([
    options.client.iserver.accounts.get(),
    options.client.portfolio.account.ledger.get(),
    loadMarketData(options.client, options.marketData),
    options.client.iserver.account.orders.get(),
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

    const ledger = Object.values(ledgerResult.value)
      .reduce((result, ledger) => {
        if (ledger === undefined) {
          return result
        }

        result[ledger.secondkey] = {
          acctCode: ledger.acctcode,
          cashbalance: ledger.cashbalance,
          cashBalanceFXSegment: ledger.cashbalancefxsegment,
          commodityMarketValue: ledger.commoditymarketvalue,
          corporateBondsMarketValue: ledger.corporatebondsmarketvalue,
          dividends: ledger.dividends,
          exchangeRate: ledger.exchangerate,
          funds: ledger.funds,
          interest: ledger.interest,
          issueOptionsMarketValue: ledger.issueroptionsmarketvalue,
          key: ledger.key === 'LedgerList' ? `LedgerList${ledger.secondkey}` : ledger.key,
          marketValue: ledger.stockmarketvalue,
          moneyFunds: ledger.moneyfunds,
          netLiquidationValue: ledger.netliquidationvalue,
          optionMarketValue: ledger.stockoptionmarketvalue,
          realizedPnl: ledger.realizedpnl,
          secondKey: ledger.secondkey,
          settledCash: ledger.settledcash,
          severity: ledger.severity,
          stockMarketValue: ledger.stockmarketvalue,
          tBillsMarketValue: ledger.tbillsmarketvalue,
          tBondsMarketValue: ledger.tbondsmarketvalue,
          timestamp: ledger.timestamp,
          unrealizedPnl: ledger.unrealizedpnl,
          warrantsMarketValue: ledger.warrantsmarketvalue,
        }

        return result
      }, {} as Record<Currency3OrBase, undefined | Writable<LedgerMessage>>)

    return {
      accounts: accountsResult.value,
      ledger,
      marketData: marketDataResult.value,
      orders: ordersMap,
    }
  })
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
