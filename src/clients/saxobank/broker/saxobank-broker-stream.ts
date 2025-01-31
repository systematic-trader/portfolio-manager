import {
  array,
  assert,
  AssertionError,
  assertReturn,
  coerce,
  type GuardType,
  is,
  literal,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ensureError } from '../../../utils/error.ts'
import { mergeDeltaContent } from '../../../utils/merge-delta-content.ts'
import { PromiseQueue } from '../../../utils/promise-queue.ts'
import { mergeAbortSignals } from '../../../utils/signal.ts'
import { Timeout } from '../../../utils/timeout.ts'
import { HTTPClientRequestAbortError } from '../../http-client.ts'
import type { SaxoBankApplication } from '../../saxobank-application.ts'
import { WebSocketClient, WebSocketClientEventError } from '../../websocket-client.ts'
import { SaxoBankApplicationConfig } from '../config.ts'
import { SaxoBankRandom } from '../saxobank-random.ts'
import { sanitizeSaxobankValue } from '../service-group-client/sanitize-saxobank-value.ts'
import { parseSaxoBankMessage } from '../stream/saxobank-message.ts'
import { BalanceResponse } from '../types/records/balance-response.ts'
import { ClosedPositionResponseUnion } from '../types/records/closed-position-response.ts'
import { OrderResponseUnion } from '../types/records/order-response.ts'
import { PositionResponseUnion } from '../types/records/position-response.ts'
import { type PriceResponse, PriceResponseUnion } from '../types/records/price-response.ts'

type PriceResponse = { [K in keyof typeof PriceResponse]: GuardType<typeof PriceResponse[K]> }

export interface SaxoBankBrokerStream extends AsyncDisposable {
  readonly client: {
    readonly key: string
    readonly balance: BalanceResponse
    readonly orders: readonly OrderResponseUnion[]
    readonly positions: readonly PositionResponseUnion[]
    readonly closedPositions: readonly ClosedPositionResponseUnion[]
  }

  account(accountKey: string): {
    readonly key: string
    readonly balance: BalanceResponse
  }

  instrument<T extends keyof PriceResponse>(accountKey: string, assetType: T, uic: number): {
    readonly accountKey: string
    readonly assetType: T
    readonly uic: number
    readonly price: PriceResponse[T]
  }

  dispose(): Promise<void>
}

export class SaxoBankBrokerStreamPayloadError extends Error {
  readonly referenceId: string
  readonly payload: unknown
  readonly invalidations: readonly unknown[]

  constructor(referenceId: string, payload: unknown, invalidations: readonly unknown[]) {
    super(`Payload error for referenceId "${referenceId}"`)

    this.referenceId = referenceId
    this.payload = payload
    this.invalidations = invalidations
    this.name = this.constructor.name
  }
}

export async function SaxoBankBrokerStream(
  options: {
    readonly app: SaxoBankApplication
    readonly clientKey: string
    readonly accounts: Record<
      /* account key */ string,
      Record</* asset type */ keyof PriceResponse, /* uics */ readonly number[]>
    >
    readonly inactivityTimeout?: undefined | number
    readonly signal?: undefined | AbortSignal
  },
): Promise<SaxoBankBrokerStream> {
  const { app, clientKey, accounts, inactivityTimeout = 60_000 } = options
  const { addDisposer, assertContext, disposeContext, enqueue, signal } = createContext(
    options.signal,
  )
  const contextId = SaxoBankRandom.stream.contextID()
  const subscriptionsMap = new Map<
    /* referenceId */ string,
    {
      touchedAt: number
      readonly type: 'balance'
      readonly inactivityTimeout: number
      readonly accountKey: undefined | string
    } | {
      touchedAt: number
      readonly type: 'price'
      readonly inactivityTimeout: number
      readonly accountKey: string
      readonly assetType: string
      readonly uic: number
    } | {
      touchedAt: number
      readonly type: 'orders' | 'positions' | 'closed-positions'
      readonly inactivityTimeout: number
    }
  >()
  const accountsMap = new Map</* accountKey */ string, { balance: BalanceResponse }>()
  const instrumentsMap = new Map<
    /* accountKey */ string,
    Map<string, Map</* uic*/ number, { price: PriceResponse[keyof PriceResponse] }>>
  >()
  const reauthorizingURL = new URL(SaxoBankApplicationConfig[app.type].websocketReauthorizingURL)

  reauthorizingURL.searchParams.set('contextId', contextId)

  let messageId = 0
  let heartbeatMonitor: undefined | Timeout<void> = undefined

  addDisposer(() => heartbeatMonitor?.cancel())

  const websocketClient = new WebSocketClient({ url: connectURL(app, contextId, messageId), binaryType: 'arraybuffer' })

  addDisposer(() => websocketClient.close())

  let streamTouchedAt = Date.now()

  function startHeartbeat(): void {
    heartbeatMonitor?.cancel()

    if (websocketClient.state.status !== 'open') {
      return
    }

    streamTouchedAt = Date.now()

    const monitor = heartbeatMonitor = Timeout.repeat(1000, () => {
      if (monitor !== heartbeatMonitor || signal.aborted) {
        monitor.cancel()
      } else {
        const now = Date.now()

        let reconnect = false

        for (
          const { inactivityTimeout: subscriptionInactivityTimeout, touchedAt: subscriptionTouchedAt }
            of subscriptionsMap
              .values()
        ) {
          streamTouchedAt = Math.max(streamTouchedAt, subscriptionTouchedAt)

          const elapsed = now - subscriptionTouchedAt

          if (elapsed > subscriptionInactivityTimeout) {
            reconnect = true
            break
          }
        }

        if (now - streamTouchedAt > inactivityTimeout) {
          reconnect = true
        }

        if (reconnect) {
          monitor.cancel()

          enqueue(() => websocketClient.reconnect({ connect: { url: connectURL(app, contextId, messageId), signal } }))
        }
      }
    })
  }

  function updateAccessToken(accessToken: string): void {
    enqueue(async () => {
      if (websocketClient.state.status !== 'open') {
        return
      }

      try {
        await app.http.put(reauthorizingURL, {
          headers: {
            Authorization: `BEARER ${accessToken}`,
          },
          signal,
        })
      } catch (error) {
        if (error instanceof HTTPClientRequestAbortError) {
          return
        }

        throw error
      }
    })
  }

  websocketClient.addListener('error', (event) => {
    if (
      signal.aborted === false &&
      'message' in event &&
      typeof event.message === 'string' &&
      event.message.toLowerCase().includes('connection reset')
    ) {
      enqueue(() => websocketClient.reconnect({ connect: { url: connectURL(app, contextId, messageId), signal } }))

      return
    }

    disposeContext(new WebSocketClientEventError({ event, url: websocketClient.url })).catch(() => {})
  })

  websocketClient.addListener('close', () => {
    heartbeatMonitor?.cancel()
    app.auth.removeListener('accessToken', updateAccessToken)
  })

  websocketClient.addListener('message', (event) => {
    if (signal.aborted) {
      return
    }

    streamTouchedAt = Date.now()

    const messages = parseSaxoBankMessage(event.data)

    for (const message of messages) {
      messageId = message.messageId

      switch (message.referenceId) {
        case '_heartbeat': {
          const [{ Heartbeats }] = message.payload as [
            {
              ReferenceId: '_heartbeat'
              Heartbeats: ReadonlyArray<
                {
                  OriginatingReferenceId: string
                  Reason: 'NoNewData' | 'SubscriptionTemporarilyDisabled' | 'SubscriptionPermanentlyDisabled'
                }
              >
            },
          ]

          for (const { OriginatingReferenceId, Reason } of Heartbeats) {
            const subscription = subscriptionsMap.get(OriginatingReferenceId)

            if (subscription === undefined) {
              continue
            }

            switch (Reason) {
              case 'NoNewData':
              case 'SubscriptionTemporarilyDisabled': {
                subscription.touchedAt = Date.now() // Problem, da det skaber et reconnect og ikke enkeltvis re-subscribe

                break
              }

              case 'SubscriptionPermanentlyDisabled': {
                let message: undefined | string = undefined

                const { type: subscriptionType } = subscription

                switch (subscriptionType) {
                  case 'balance':
                  case 'price': {
                    if (subscription.accountKey === undefined) {
                      message = `Subscription type "${subscriptionType}" for client permanently disabled.`
                    } else {
                      message =
                        `Subscription type "${subscriptionType}" for account "${subscription.accountKey}" permanently disabled.`
                    }
                    break
                  }

                  case 'orders':
                  case 'positions':
                  case 'closed-positions': {
                    message = `Subscription type "${subscriptionType}" permanently disabled.`
                    break
                  }

                  default: {
                    message = `Unknown subscription type "${subscriptionType}".`
                  }
                }

                disposeContext(new Error(message)).catch(() => {})

                break
              }

              default: {
                break
              }
            }
          }

          break
        }

        case '_disconnect': {
          enqueue(() => websocketClient.reconnect({ connect: { url: connectURL(app, contextId, messageId), signal } }))
          break
        }

        case '_resetsubscriptions': {
          enqueue(async () => {
            if (websocketClient.state.status !== 'open') {
              return
            }

            const [{ TargetReferenceIds }] = message.payload as [
              { ReferenceId: '_resetsubscriptions'; TargetReferenceIds: readonly string[] },
            ]

            const entries = subscriptionsMap.entries().filter(([referenceId]) => {
              if (TargetReferenceIds.length === 0) {
                return true
              }

              return TargetReferenceIds.includes(referenceId)
            })

            for (const [referenceId, subscription] of entries) {
              const { type: subscriptionType } = subscription

              switch (subscriptionType) {
                case 'balance': {
                  const newSubscription = await subcribeBalance({
                    app,
                    contextId,
                    signal,
                    clientKey,
                    accountKey: subscription.accountKey,
                    previousReferenceId: referenceId,
                  })

                  subscriptionsMap.delete(referenceId)

                  subscriptionsMap.set(newSubscription.referenceId, {
                    touchedAt: Date.now(),
                    type: 'balance',
                    inactivityTimeout: newSubscription.inactivityTimeout,
                    accountKey: subscription.accountKey,
                  })

                  if (newSubscription.accountKey === undefined) {
                    client.balance = newSubscription.balance
                  } else {
                    accountsMap.set(newSubscription.accountKey, { balance: newSubscription.balance })
                  }

                  break
                }

                case 'price': {
                  const newSubscription = await subscribePrice({
                    app,
                    contextId,
                    signal,
                    accountKey: subscription.accountKey,
                    assetType: subscription.assetType,
                    uic: subscription.uic,
                    previousReferenceId: referenceId,
                  })

                  subscriptionsMap.delete(referenceId)

                  subscriptionsMap.set(newSubscription.referenceId, {
                    touchedAt: Date.now(),
                    type: 'price',
                    inactivityTimeout: newSubscription.inactivityTimeout,
                    accountKey: newSubscription.accountKey,
                    assetType: newSubscription.assetType,
                    uic: newSubscription.uic,
                  })

                  let accountMap = instrumentsMap.get(newSubscription.accountKey)

                  if (accountMap === undefined) {
                    accountMap = new Map()
                    instrumentsMap.set(newSubscription.accountKey, accountMap)
                  }

                  let assetTypeMap = accountMap.get(newSubscription.assetType)

                  if (assetTypeMap === undefined) {
                    assetTypeMap = new Map()
                    accountMap.set(newSubscription.assetType, assetTypeMap)
                  }

                  let instrument = assetTypeMap.get(newSubscription.uic)

                  if (instrument === undefined) {
                    instrument = { price: newSubscription.price }
                    assetTypeMap.set(newSubscription.uic, instrument)
                  } else {
                    instrument.price = newSubscription.price
                  }

                  break
                }

                case 'orders': {
                  const newSubscription = await subscribeOrders({
                    app,
                    contextId,
                    signal,
                    clientKey,
                    previousReferenceId: referenceId,
                  })

                  subscriptionsMap.delete(referenceId)

                  subscriptionsMap.set(newSubscription.referenceId, {
                    touchedAt: Date.now(),
                    type: 'orders',
                    inactivityTimeout: newSubscription.inactivityTimeout,
                  })

                  client.orders = newSubscription.orders

                  break
                }

                case 'positions': {
                  const newSubscription = await subscribePositions({
                    app,
                    contextId,
                    signal,
                    clientKey,
                    previousReferenceId: referenceId,
                  })

                  subscriptionsMap.delete(referenceId)

                  subscriptionsMap.set(newSubscription.referenceId, {
                    touchedAt: Date.now(),
                    type: 'positions',
                    inactivityTimeout: newSubscription.inactivityTimeout,
                  })

                  client.positions = newSubscription.positions

                  break
                }

                case 'closed-positions': {
                  const newSubscription = await subscribeClosedPositions({
                    app,
                    contextId,
                    signal,
                    clientKey,
                    previousReferenceId: referenceId,
                  })

                  subscriptionsMap.delete(referenceId)

                  subscriptionsMap.set(newSubscription.referenceId, {
                    touchedAt: Date.now(),
                    type: 'closed-positions',
                    inactivityTimeout: newSubscription.inactivityTimeout,
                  })

                  client.closedPositions = newSubscription.closedPositions

                  break
                }

                default: {
                  throw new Error(`Unknown reset subscription type "${subscriptionType}".`)
                }
              }
            }
          })

          break
        }

        default: {
          const subscription = subscriptionsMap.get(message.referenceId)

          if (subscription === undefined) {
            enqueue(async () => {
              try {
                await app.rootServices.subscriptions.delete({
                  ContextId: contextId,
                  Tag: message.referenceId,
                }, {
                  signal,
                })
              } catch (error) {
                if (error instanceof HTTPClientRequestAbortError) {
                  return
                }

                throw error
              }
            })
          } else {
            const payload = sanitizeSaxobankValue(message.payload)
            const { type: subscriptionType } = subscription

            try {
              switch (subscriptionType) {
                case 'balance': {
                  const balanceHolder = subscription.accountKey === undefined
                    ? client
                    : accountsMap.get(subscription.accountKey)!

                  balanceHolder.balance = parse.balance(balanceHolder.balance, payload)

                  break
                }

                case 'orders': {
                  client.orders = parse.orders(client.orders, payload)

                  break
                }

                case 'closed-positions': {
                  client.closedPositions = parse.closedPositions(client.closedPositions, payload)

                  break
                }

                case 'price': {
                  const instrument = instrumentsMap.get(subscription.accountKey)!.get(subscription.assetType)!.get(
                    subscription.uic,
                  )!

                  instrument.price = parse.price(instrument.price, payload)

                  break
                }

                case 'positions': {
                  client.positions = parse.positions(client.positions, payload)

                  break
                }

                default: {
                  throw new Error(`Unknown subscription type "${subscriptionType}".`)
                }
              }
            } catch (caughtError) {
              const error = caughtError instanceof AssertionError
                ? new SaxoBankBrokerStreamPayloadError(message.referenceId, payload, caughtError.invalidations)
                : ensureError(caughtError)

              disposeContext(error).catch(() => {})
            }
          }

          // TODO handle message
          break
        }
      }
    }
  })

  await websocketClient.connect({ signal })

  app.auth.addListener('accessToken', updateAccessToken, { persistent: true, sequential: true })

  const clientBalanceSubscription = await subcribeBalance({
    app,
    contextId,
    signal,
    clientKey,
  })

  subscriptionsMap.set(clientBalanceSubscription.referenceId, {
    type: 'balance',
    touchedAt: Date.now(),
    inactivityTimeout: clientBalanceSubscription.inactivityTimeout,
    accountKey: undefined,
  })

  const clientOrdersSubscription = await subscribeOrders({
    app,
    contextId,
    signal,
    clientKey,
  })

  subscriptionsMap.set(clientOrdersSubscription.referenceId, {
    type: 'orders',
    touchedAt: Date.now(),
    inactivityTimeout: clientOrdersSubscription.inactivityTimeout,
  })

  const clientPositionSubscription = await subscribePositions({
    app,
    contextId,
    signal,
    clientKey,
  })

  subscriptionsMap.set(clientPositionSubscription.referenceId, {
    touchedAt: Date.now(),
    type: 'positions',
    inactivityTimeout: clientPositionSubscription.inactivityTimeout,
  })

  const clientClosedPositionSubscription = await subscribeClosedPositions({
    app,
    contextId,
    signal,
    clientKey,
  })

  subscriptionsMap.set(clientClosedPositionSubscription.referenceId, {
    touchedAt: Date.now(),
    type: 'closed-positions',
    inactivityTimeout: clientClosedPositionSubscription.inactivityTimeout,
  })

  const client = {
    balance: clientBalanceSubscription.balance,
    orders: clientOrdersSubscription.orders,
    positions: clientPositionSubscription.positions,
    closedPositions: clientClosedPositionSubscription.closedPositions,
  }

  for (const [accountKey, account] of Object.entries(accounts)) {
    const accountSubscription = await subcribeBalance({
      app,
      contextId,
      signal,
      clientKey,
      accountKey,
    })

    accountsMap.set(accountKey, { balance: accountSubscription.balance })

    subscriptionsMap.set(accountSubscription.referenceId, {
      touchedAt: Date.now(),
      type: 'balance',
      inactivityTimeout: accountSubscription.inactivityTimeout,
      accountKey,
    })

    for (const [assetType, uics] of Object.entries(account)) {
      let accountMap = instrumentsMap.get(accountKey)

      if (accountMap === undefined) {
        accountMap = new Map()
        instrumentsMap.set(accountKey, accountMap)
      }

      let assetTypeMap = accountMap.get(assetType)

      if (assetTypeMap === undefined) {
        assetTypeMap = new Map()
        accountMap.set(assetType, assetTypeMap)
      }

      for (const uic of uics) {
        const subscription = await subscribePrice({
          app,
          contextId,
          signal,
          accountKey,
          assetType,
          uic,
        })

        subscriptionsMap.set(subscription.referenceId, {
          touchedAt: Date.now(),
          type: 'price',
          inactivityTimeout: subscription.inactivityTimeout,
          accountKey,
          assetType,
          uic,
        })

        assetTypeMap.set(uic, { price: subscription.price })
      }
    }
  }

  startHeartbeat()

  websocketClient.addListener('open', /* This listener is only used on subsequent re-connects */ () => {
    app.auth.addListener('accessToken', updateAccessToken, { persistent: true, sequential: true })

    startHeartbeat()

    enqueue(async () => {
      if (websocketClient.state.status !== 'open') {
        return
      }

      try {
        await app.rootServices.subscriptions.delete({ ContextId: contextId })

        subscriptionsMap.clear()

        const clientSubscription = await subcribeBalance({
          app,
          contextId,
          signal,
          clientKey,
        })

        subscriptionsMap.set(clientSubscription.referenceId, {
          touchedAt: Date.now(),
          type: 'balance',
          inactivityTimeout: clientSubscription.inactivityTimeout,
          accountKey: undefined,
        })

        client.balance = clientSubscription.balance

        const ordersSubscription = await subscribeOrders({
          app,
          contextId,
          signal,
          clientKey,
        })

        subscriptionsMap.set(ordersSubscription.referenceId, {
          touchedAt: Date.now(),
          type: 'orders',
          inactivityTimeout: ordersSubscription.inactivityTimeout,
        })

        client.orders = ordersSubscription.orders

        const positionsSubscription = await subscribePositions({
          app,
          contextId,
          signal,
          clientKey,
        })

        subscriptionsMap.set(positionsSubscription.referenceId, {
          touchedAt: Date.now(),
          type: 'positions',
          inactivityTimeout: positionsSubscription.inactivityTimeout,
        })

        client.positions = positionsSubscription.positions

        const closedPositionsSubscription = await subscribeClosedPositions({
          app,
          contextId,
          signal,
          clientKey,
        })

        subscriptionsMap.set(closedPositionsSubscription.referenceId, {
          touchedAt: Date.now(),
          type: 'closed-positions',
          inactivityTimeout: closedPositionsSubscription.inactivityTimeout,
        })

        client.closedPositions = closedPositionsSubscription.closedPositions

        for (const [accountKey, account] of Object.entries(accounts)) {
          const accountSubscription = await subcribeBalance({
            app,
            contextId,
            signal,
            clientKey,
            accountKey,
          })

          const accountValue = accountsMap.get(accountKey)

          if (accountValue === undefined) {
            accountsMap.set(accountKey, { balance: accountSubscription.balance })
          } else {
            accountValue.balance = accountSubscription.balance
          }

          subscriptionsMap.set(accountSubscription.referenceId, {
            touchedAt: Date.now(),
            type: 'balance',
            inactivityTimeout: accountSubscription.inactivityTimeout,
            accountKey,
          })

          for (const [assetType, uics] of Object.entries(account)) {
            let accountMap = instrumentsMap.get(accountKey)

            if (accountMap === undefined) {
              accountMap = new Map()
              instrumentsMap.set(accountKey, accountMap)
            }

            let assetTypeMap = accountMap.get(assetType)

            if (assetTypeMap === undefined) {
              assetTypeMap = new Map()
              accountMap.set(assetType, assetTypeMap)
            }

            for (const uic of uics) {
              const subscription = await subscribePrice({
                app,
                contextId,
                signal,
                accountKey,
                assetType,
                uic,
              })

              subscriptionsMap.set(subscription.referenceId, {
                touchedAt: Date.now(),
                type: 'price',
                inactivityTimeout: subscription.inactivityTimeout,
                accountKey,
                assetType,
                uic,
              })

              const instrument = assetTypeMap.get(uic)

              if (instrument === undefined) {
                assetTypeMap.set(uic, { price: subscription.price })
              } else {
                instrument.price = subscription.price
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof HTTPClientRequestAbortError) {
          return
        }

        throw error
      }
    })
  })

  try {
    return {
      [Symbol.asyncDispose]: () => {
        return disposeContext()
      },

      dispose: () => disposeContext(),

      client: {
        get key(): string {
          assertContext()

          return clientKey
        },

        get balance(): BalanceResponse {
          assertContext()

          return client.balance
        },

        get orders(): readonly OrderResponseUnion[] {
          assertContext()

          return client.orders
        },

        get positions(): readonly PositionResponseUnion[] {
          assertContext()

          return client.positions
        },

        get closedPositions(): readonly ClosedPositionResponseUnion[] {
          assertContext()

          return []
        },
      },

      account(accountKey): {
        readonly key: string
        readonly balance: BalanceResponse
      } {
        assertContext()

        const account = accountsMap.get(accountKey)

        if (account === undefined) {
          throw new Error(`Account "${accountKey}" not found.`)
        }

        return {
          get key(): string {
            assertContext()

            return accountKey
          },
          get balance(): BalanceResponse {
            assertContext()

            return account.balance
          },
        }
      },

      instrument<T extends keyof PriceResponse>(
        accountKey: string,
        assetType: T,
        uic: number,
      ): {
        readonly accountKey: string
        readonly assetType: T
        readonly uic: number
        readonly price: PriceResponse[T]
      } {
        assertContext()

        const instrument = instrumentsMap.get(accountKey)?.get(assetType)?.get(uic)

        if (instrument === undefined) {
          throw new Error(`Account with key "${accountKey}" does not have instrument "${assetType}" with UIC ${uic}.`)
        }

        return {
          get accountKey(): string {
            assertContext()

            return accountKey
          },
          get assetType(): T {
            assertContext()

            return assetType
          },
          get uic(): number {
            assertContext()

            return uic
          },

          get price(): PriceResponse[T] {
            assertContext()

            return instrument.price as PriceResponse[T]
          },
        }
      },
    }
  } catch (error) {
    await disposeContext(ensureError(error))

    throw error
  }
}

function connectURL(app: SaxoBankApplication, contextId: string, messageId: number): string {
  const connectURL = new URL(SaxoBankApplicationConfig[app.type].websocketConnectURL)

  if (app.auth.accessToken !== undefined) {
    connectURL.searchParams.set('authorization', `Bearer ${app.auth.accessToken}`)
  }

  connectURL.searchParams.set('contextId', contextId)

  if (messageId === 0) {
    connectURL.searchParams.delete('messageid')
  } else {
    connectURL.searchParams.set('messageid', messageId.toString())
  }

  return connectURL.toString()
}

function createContext(signal: undefined | AbortSignal): {
  addDisposer(disposer: () => unknown): void
  assertContext: () => void
  disposeContext(caughtError?: undefined | Error): Promise<void>
  enqueue<T>(callback: () => T | Promise<T>): Promise<T>
  isContextDisposed(): boolean
  signal: AbortSignal
} {
  let disposePromise: undefined | Promise<void> = undefined
  let error: undefined | Error = undefined

  const controller = new AbortController()
  const mergedSignal = mergeAbortSignals(signal, controller.signal) ?? controller.signal
  const queue = new PromiseQueue((caughtError) => {
    error = caughtError
  })
  const disposers: Array<() => unknown> = []

  async function disposeContext(caughtError?: undefined | Error): Promise<void> {
    if (disposePromise !== undefined) {
      return await disposePromise
    }

    if (error !== undefined && error instanceof HTTPClientRequestAbortError === false) {
      error = caughtError
    }

    if (controller.signal.aborted) {
      if (error !== undefined) {
        throw error
      }

      return
    }

    controller.abort()

    // Let the abort signal propagate to the queue
    await Timeout.wait(0)

    for (const disposer of disposers) {
      queue.call(disposer)
    }

    disposePromise = queue.drain()
      .then(() => {
        if (error !== undefined) {
          throw error
        }
      })
      .finally(() => {
        disposePromise = undefined
      })

    return disposePromise
  }

  mergedSignal.addEventListener('abort', () => {
    disposeContext().catch(() => {})
  }, { once: true })

  return {
    addDisposer: (disposer) => {
      disposers.push(disposer)
    },
    assertContext: () => {
      if (error !== undefined) {
        throw error
      }
    },
    disposeContext,
    enqueue: <T>(callback: () => T | Promise<T>): Promise<T> => {
      const { promise, resolve, reject } = Promise.withResolvers<T>()

      queue.call(async () => {
        if (mergedSignal.aborted) {
          return
        }

        try {
          resolve(await callback())
        } catch (error) {
          reject(error)
        }
      })

      return promise
    },
    isContextDisposed: () => controller.signal.aborted,
    signal: mergedSignal,
  }
}

async function subcribeBalance<AccountKey extends undefined | string = undefined>(
  {
    app,
    contextId,
    signal,
    clientKey,
    accountKey,
    previousReferenceId,
  }: {
    readonly app: SaxoBankApplication
    readonly contextId: string
    readonly signal: AbortSignal
    readonly clientKey: string
    readonly accountKey?: AccountKey
    readonly previousReferenceId?: undefined | string
  },
): Promise<{
  accountKey: undefined | AccountKey
  referenceId: string
  inactivityTimeout: number
  balance: BalanceResponse
}> {
  const referenceId = SaxoBankRandom.stream.referenceID(`balance`)

  const subscription = await app.portfolio.balances.subscriptions.post({
    Arguments: { ClientKey: clientKey, AccountKey: accountKey },
    ContextId: contextId,
    Format: 'application/json',
    RefreshRate: 1000,
    ReferenceId: referenceId,
    ReplaceReferenceId: previousReferenceId,
    Tag: referenceId,
  }, { signal })

  return {
    accountKey,
    referenceId,
    inactivityTimeout: subscription.InactivityTimeout * 1000,
    balance: subscription.Snapshot,
  }
}

async function subscribeOrders<AccountKey extends undefined | string = undefined>({
  app,
  contextId,
  signal,
  clientKey,
  accountKey,
  previousReferenceId,
}: {
  readonly app: SaxoBankApplication
  readonly contextId: string
  readonly signal: AbortSignal
  readonly clientKey: string
  readonly accountKey?: AccountKey
  readonly previousReferenceId?: undefined | string
}): Promise<{
  readonly accountKey: undefined | AccountKey
  readonly referenceId: string
  readonly inactivityTimeout: number
  readonly orders: readonly OrderResponseUnion[]
}> {
  const referenceId = SaxoBankRandom.stream.referenceID(`orders`)

  const response = await app.portfolio.orders.subscriptions.post({
    Arguments: {
      ClientKey: clientKey,
      AccountKey: accountKey,
    },
    ContextId: contextId,
    ReferenceId: referenceId,
    ReplaceReferenceId: previousReferenceId,
    Format: 'application/json',
    RefreshRate: 1000,
    Tag: referenceId,
  }, { signal })

  if (response.Snapshot === undefined) {
    return {
      accountKey,
      referenceId,
      inactivityTimeout: response.InactivityTimeout * 1000,
      orders: [],
    }
  }

  const { __count, __next, Data = [], MaxRows } = response.Snapshot

  if (__next !== undefined) {
    throw new Error(`Expected all data to be delivered in a single snapshot, but got a __next-property`)
  }

  if (__count !== undefined && __count > Data.length) {
    throw new Error(
      `Expected all data to be delivered in a single snapshot, but only got ${Data.length}/${__count} elements`,
    )
  }

  if (__count !== undefined && MaxRows !== undefined && __count > MaxRows) {
    throw new Error(
      `Expected all data to be delivered in a single snapshot, but there are more data available than the MaxRows-property allows (${__count}/${MaxRows})`,
    )
  }

  const orders = assertReturn(array(OrderResponseUnion), coerce(OrderResponseUnion)(Data))

  return {
    accountKey,
    referenceId: response.ReferenceId,
    inactivityTimeout: response.InactivityTimeout * 1000,
    orders,
  }
}

async function subscribePositions<AccountKey extends undefined | string = undefined>({
  app,
  contextId,
  signal,
  clientKey,
  accountKey,
  previousReferenceId,
}: {
  readonly app: SaxoBankApplication
  readonly contextId: string
  readonly signal: AbortSignal
  readonly clientKey: string
  readonly accountKey?: AccountKey
  readonly previousReferenceId?: undefined | string
}): Promise<{
  readonly accountKey: undefined | AccountKey
  readonly referenceId: string
  readonly inactivityTimeout: number
  readonly positions: readonly PositionResponseUnion[]
}> {
  const referenceId = SaxoBankRandom.stream.referenceID(`positions`)

  const response = await app.portfolio.positions.subscriptions.post({
    Arguments: {
      ClientKey: clientKey,
      AccountKey: accountKey,
    },
    ContextId: contextId,
    ReferenceId: referenceId,
    ReplaceReferenceId: previousReferenceId,
    Format: 'application/json',
    RefreshRate: 1000,
    Tag: referenceId,
  }, { signal })

  if (response.Snapshot === undefined) {
    return {
      accountKey,
      referenceId,
      inactivityTimeout: response.InactivityTimeout * 1000,
      positions: [],
    }
  }

  const { __count, __next, Data = [], MaxRows } = response.Snapshot

  if (__next !== undefined) {
    throw new Error(`Expected all data to be delivered in a single snapshot, but got a __next-property`)
  }

  if (__count !== undefined && __count > Data.length) {
    throw new Error(
      `Expected all data to be delivered in a single snapshot, but only got ${Data.length}/${__count} elements`,
    )
  }

  if (__count !== undefined && MaxRows !== undefined && __count > MaxRows) {
    throw new Error(
      `Expected all data to be delivered in a single snapshot, but there are more data available than the MaxRows-property allows (${__count}/${MaxRows})`,
    )
  }

  const positions = assertReturn(array(PositionResponseUnion), coerce(PositionResponseUnion)(Data))

  return {
    accountKey,
    referenceId: response.ReferenceId,
    inactivityTimeout: response.InactivityTimeout * 1000,
    positions,
  }
}

async function subscribeClosedPositions<AccountKey extends undefined | string = undefined>({
  app,
  contextId,
  signal,
  clientKey,
  accountKey,
  previousReferenceId,
}: {
  readonly app: SaxoBankApplication
  readonly contextId: string
  readonly signal: AbortSignal
  readonly clientKey: string
  readonly accountKey?: AccountKey
  readonly previousReferenceId?: undefined | string
}): Promise<{
  readonly accountKey: undefined | AccountKey
  readonly referenceId: string
  readonly inactivityTimeout: number
  readonly closedPositions: readonly ClosedPositionResponseUnion[]
}> {
  const referenceId = SaxoBankRandom.stream.referenceID(`closed-positions`)

  const response = await app.portfolio.closedPositions.subscriptions.post({
    Arguments: {
      ClientKey: clientKey,
      AccountKey: accountKey,
    },
    ContextId: contextId,
    ReferenceId: referenceId,
    ReplaceReferenceId: previousReferenceId,
    Format: 'application/json',
    RefreshRate: 1000,
    Tag: referenceId,
  }, { signal })

  if (response.Snapshot === undefined) {
    return {
      accountKey,
      referenceId,
      inactivityTimeout: response.InactivityTimeout * 1000,
      closedPositions: [],
    }
  }

  const { __count, __next, Data = [], MaxRows } = response.Snapshot

  if (__next !== undefined) {
    throw new Error(`Expected all data to be delivered in a single snapshot, but got a __next-property`)
  }

  if (__count !== undefined && __count > Data.length) {
    throw new Error(
      `Expected all data to be delivered in a single snapshot, but only got ${Data.length}/${__count} elements`,
    )
  }

  if (__count !== undefined && MaxRows !== undefined && __count > MaxRows) {
    throw new Error(
      `Expected all data to be delivered in a single snapshot, but there are more data available than the MaxRows-property allows (${__count}/${MaxRows})`,
    )
  }

  const closedPositions = assertReturn(array(ClosedPositionResponseUnion), coerce(ClosedPositionResponseUnion)(Data))

  return {
    accountKey,
    referenceId: response.ReferenceId,
    inactivityTimeout: response.InactivityTimeout * 1000,
    closedPositions,
  }
}

async function subscribePrice({
  app,
  contextId,
  signal,
  accountKey,
  assetType,
  uic,
  previousReferenceId,
}: {
  readonly app: SaxoBankApplication
  readonly contextId: string
  readonly signal: AbortSignal
  readonly accountKey: string
  readonly assetType: string
  readonly uic: number
  readonly previousReferenceId?: undefined | string
}): Promise<{
  readonly accountKey: string
  readonly assetType: keyof PriceResponse
  readonly uic: number
  readonly referenceId: string
  readonly inactivityTimeout: number
  readonly price: PriceResponse[keyof PriceResponse]
}> {
  const referenceId = SaxoBankRandom.stream.referenceID(`price`)

  const subscription = await app.trading.prices.subscriptions.post({
    Arguments: {
      AccountKey: accountKey,
      AssetType: assetType as keyof PriceResponse,
      Uic: uic,
    },
    ContextId: contextId,
    ReferenceId: referenceId,
    ReplaceReferenceId: previousReferenceId,
    Format: 'application/json',
    RefreshRate: 1000,
    Tag: referenceId,
  }, { signal })

  return {
    accountKey,
    assetType: assetType as keyof PriceResponse,
    uic,
    referenceId,
    inactivityTimeout: subscription.InactivityTimeout * 1000,
    price: subscription.Snapshot,
  }
}

const OrdersPayload = array(props({
  OrderId: string(),
}, { extendable: true }))

const OrderDeletedMessage = props({
  OrderId: string(),
  '__meta_deleted': literal(true),
}, { extendable: true })

const isOrderDeletedMessage = is(OrderDeletedMessage)

const PositionsPayload = array(props({
  PositionId: string(),
}, { extendable: true }))

const PositionDeletedMessage = props({
  PositionId: string(),
  '__meta_deleted': literal(true),
}, { extendable: true })

const isPositionDeletedMessage = is(PositionDeletedMessage)

const ClosedPositionPayload = array(props({
  ClosedPositionUniqueId: string(),
}, { extendable: true }))

const ClosedPositionDeletedMessage = props({
  ClosedPositionUniqueId: string(),
  '__meta_deleted': literal(true),
}, { extendable: true })

const isClosedPositionDeletedMessage = is(ClosedPositionDeletedMessage)

const parse = {
  balance(previous: BalanceResponse, payload: unknown): BalanceResponse {
    const merged = mergeDeltaContent(previous, payload)

    return assertReturn(BalanceResponse, coerce(BalanceResponse)(merged))
  },

  orders(previous: readonly OrderResponseUnion[], payload: unknown): readonly OrderResponseUnion[] {
    assert(OrdersPayload, payload)

    return payload.reduce<readonly OrderResponseUnion[]>((orders, message) => {
      const index = orders.findIndex((order) => order.OrderId === message.OrderId)
      const order = orders[index]

      // If we don't know the order by it's ID, we assume it's a new order - and it must pass the order guard
      if (order === undefined) {
        assert(OrderResponseUnion, message)
        return [...orders, message]
      }

      // If we do know the order id, we should check for the the __meta_deleted-property (this happens when the order is filled or cancelled)
      if (isOrderDeletedMessage(message)) {
        return [...orders.slice(0, index), ...orders.slice(index + 1)]
      }

      // If none of the above matches the message, the message must be a update to the order (containing only the changed properties)
      const mergedOrder = mergeDeltaContent(order, message)
      assert(OrderResponseUnion, mergedOrder)
      return [...orders.slice(0, index), mergedOrder, ...orders.slice(index + 1)]
    }, previous)
  },

  positions(previous: readonly PositionResponseUnion[], payload: unknown): readonly PositionResponseUnion[] {
    assert(PositionsPayload, payload)

    return payload.reduce<readonly PositionResponseUnion[]>((positions, message) => {
      const index = positions.findIndex((position) => position.PositionId === message.PositionId)
      const position = positions[index]

      // If we don't know the position by it's ID, we assume it's a new position - and it must pass the position guard
      if (position === undefined) {
        assert(PositionResponseUnion, message)
        return [...positions, message]
      }

      // If we do know the position id, we should check for the the __meta_deleted-property (this happens when the position is filled or cancelled)
      if (isPositionDeletedMessage(message)) {
        return [...positions.slice(0, index), ...positions.slice(index + 1)]
      }

      // If none of the above matches the message, the message must be a update to the position (containing only the changed properties)
      const mergedPosition = mergeDeltaContent(position, message)
      assert(PositionResponseUnion, mergedPosition)
      return [...positions.slice(0, index), mergedPosition, ...positions.slice(index + 1)]
    }, previous)
  },

  closedPositions(
    previous: readonly ClosedPositionResponseUnion[],
    payload: unknown,
  ): readonly ClosedPositionResponseUnion[] {
    assert(ClosedPositionPayload, payload)

    return payload.reduce<readonly ClosedPositionResponseUnion[]>((closedPositions, message) => {
      const index = closedPositions.findIndex((closedPosition) =>
        closedPosition.ClosedPositionUniqueId === message.ClosedPositionUniqueId
      )
      const closedPosition = closedPositions[index]

      // If we don't know the closed position by it's ID, we assume it's a new closed position - and it must pass the closed position guard
      if (closedPosition === undefined) {
        assert(ClosedPositionResponseUnion, message)
        return [...closedPositions, message]
      }

      // If we do know the closed position id, we should check for the the __meta_deleted-property (this happens when the closed position is filled or cancelled)
      if (isClosedPositionDeletedMessage(message)) {
        return [...closedPositions.slice(0, index), ...closedPositions.slice(index + 1)]
      }

      // If none of the above matches the message, the message must be a update to the closed position (containing only the changed properties)
      const mergedClosedPosition = mergeDeltaContent(closedPosition, message)
      assert(ClosedPositionResponseUnion, mergedClosedPosition)
      return [...closedPositions.slice(0, index), mergedClosedPosition, ...closedPositions.slice(index + 1)]
    }, previous)
  },

  price(previous: PriceResponse[keyof PriceResponse], payload: unknown): PriceResponse[keyof PriceResponse] {
    const merged = mergeDeltaContent(previous, payload)

    return assertReturn(PriceResponseUnion, merged)
  },
}
