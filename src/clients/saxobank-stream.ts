import type { ArgumentType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Debug } from '../utils/debug.ts'
import { ensureError } from '../utils/error.ts'
import { EventSwitch } from '../utils/event-switch.ts'
import { PromiseQueue } from '../utils/promise-queue.ts'
import { mergeAbortSignals } from '../utils/signal.ts'
import { Timeout } from '../utils/timeout.ts'
import { HTTPClientRequestAbortError } from './http-client.ts'
import type { SaxoBankApplication } from './saxobank-application.ts'
import { SaxoBankApplicationConfig } from './saxobank/config.ts'
import { SaxoBankRandom } from './saxobank/saxobank-random.ts'
import { parseSaxoBankMessage } from './saxobank/stream/saxobank-message.ts'
import type { SaxoBankSubscription } from './saxobank/stream/saxobank-subscription.ts'
import { SaxoBankSubscriptionBalance } from './saxobank/stream/subscriptions/saxobank-subscription-balance.ts'
import {
  type InfoPriceSubscriptionOptions,
  SaxoBankSubscriptionInfoPrice,
} from './saxobank/stream/subscriptions/saxobank-subscription-info-price.ts'
import { SaxoBankSubscriptionOrders } from './saxobank/stream/subscriptions/saxobank-subscription-orders.ts'
import { SaxoBankSubscriptionPrice } from './saxobank/stream/subscriptions/saxobank-subscription-price.ts'
import type { BalanceRequest } from './saxobank/types/records/balance-request.ts'
import type { OpenOrdersRequest } from './saxobank/types/records/open-orders-request.ts'
import type { PriceRequest } from './saxobank/types/records/price-request.ts'
import { WebSocketClient, WebSocketClientEventError } from './websocket-client.ts'

const debug = {
  disposed: Debug('stream:disposed'),
  error: Debug('stream:error'),

  message: {
    heartbeat: Debug('stream:message:heartbeat'),
    resetSubscriptions: Debug('stream:message:reset-subscriptions'),
    snapshot: Debug('stream:message:snapshot'),
  },

  subscribed: Debug('stream:subscribed'),
  unsubscribed: Debug('stream:unsubscribed'),
}

export class SaxoBankStreamError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class SaxoBankStreamSubscribeTimeoutError extends SaxoBankStreamError {
  readonly contextId: string
  readonly timeout: number
  readonly url: string

  constructor(
    { contextId, timeout, url }: { readonly contextId: string; readonly timeout: number; readonly url: string },
  ) {
    super('SaxoBankStream is disposed.')
    this.contextId = contextId
    this.timeout = timeout
    this.url = url
  }
}

// TODO: create new class called SaxoBankStream with the same interface as the currect class,
// but with 4 instances of currect SaxoBankStream.
// SaxoBank allows 4 webscoket connections per account with 200 subscriptions per connection.

export class SaxoBankStream extends EventSwitch<{
  disposed: [error?: undefined | Error]
}> implements AsyncDisposable {
  readonly #app: SaxoBankApplication
  readonly #inactivityTimeout: number
  // deno-lint-ignore no-explicit-any
  readonly #subscriptions = new Map<string, SaxoBankSubscription<any>>()
  readonly #websocket: WebSocketClient
  readonly #queueStream: PromiseQueue
  readonly #queueAccessToken: PromiseQueue
  readonly #contextId = SaxoBankRandom.stream.contextId()
  readonly #controller = new AbortController()
  readonly #signal: AbortSignal

  #inactivityMonitor: undefined | Timeout<void>
  #error: undefined | Error
  #state: this['state']
  #messageId: number
  #connecting: boolean

  get app(): SaxoBankApplication {
    return this.#app
  }

  get contextId(): string {
    return this.#contextId
  }

  get size(): number {
    return this.#subscriptions.size
  }

  get state(): {
    readonly status: 'active'
    readonly error: undefined
  } | {
    readonly status: 'disposed'
    readonly error: undefined
  } | {
    readonly status: 'failed'
    readonly error: Error
  } {
    return this.#state
  }

  get #websocketURL(): string {
    const connectURL = new URL(SaxoBankApplicationConfig[this.#app.type].websocketConnectURL)

    if (this.#app.auth.accessToken !== undefined) {
      connectURL.searchParams.set('authorization', `Bearer ${this.#app.auth.accessToken}`)
    }

    connectURL.searchParams.set('contextId', this.#contextId)

    if (this.#messageId === 0) {
      connectURL.searchParams.delete('messageid')
    } else {
      connectURL.searchParams.set('messageid', this.#messageId.toString())
    }

    return connectURL.toString()
  }

  constructor(
    { app, inactivityTimeout = 60_000, signal }: {
      readonly app: SaxoBankApplication
      readonly inactivityTimeout?: undefined | number
      readonly signal?: undefined | AbortSignal
    },
  ) {
    if (
      inactivityTimeout !== undefined && (Number.isSafeInteger(inactivityTimeout) === false || inactivityTimeout < 1)
    ) {
      throw new TypeError('The inactivityTimeout option must be a integer greater than or equal to 1.')
    }

    const queue = new PromiseQueue((error) => this.#dispose(error))

    super(queue.createNested())

    this.#queueStream = queue
    this.#queueAccessToken = queue.createNested()

    this.#app = app
    this.#error = undefined
    this.#messageId = 0
    this.#inactivityTimeout = inactivityTimeout
    this.#inactivityMonitor = undefined
    this.#connecting = false

    this.#websocket = new WebSocketClient({ url: this.#websocketURL, binaryType: 'arraybuffer' })
    this.#websocket.addListener('open', this.#websocketOpen)
    this.#websocket.addListener('close', this.#websocketClose)
    this.#websocket.addListener('error', this.#websocketError)
    this.#websocket.addListener('message', this.#websocketMessage)

    // deno-lint-ignore no-this-alias
    const self = this

    this.#state = {
      get status() {
        if (self.#error !== undefined || self.#websocket.state.status === 'failed') {
          return 'failed'
        }

        if (self.#controller.signal.aborted) {
          return 'disposed'
        }

        return 'active'
      },

      get error() {
        return self.#error ?? self.#websocket.state.error
      },
    } as this['state']

    this.#signal = mergeAbortSignals(this.#controller.signal, signal) ?? this.#controller.signal

    if (this.#signal.aborted === true) {
      this.#controller.abort()
      return
    }

    if (this.#signal !== undefined) {
      this.#signal.addEventListener('abort', this.#dispose.bind(this, undefined), { once: true })
    }
  }

  #heartbeat(): void {
    if (this.#state.status !== 'active') {
      return
    }

    this.#inactivityMonitor?.cancel()
    this.#inactivityMonitor = Timeout.defer(this.#inactivityTimeout, () => {
      if (this.#state.status !== 'active' || this.#subscriptions.size === 0) {
        return
      }

      this.#establishStream()
    })
  }

  #dispose(error?: undefined | Error): void {
    if (this.#inactivityMonitor !== undefined) {
      this.#inactivityMonitor.cancel()
      this.#inactivityMonitor = undefined
    }

    if (this.#controller.signal.aborted) {
      return
    }

    this.#controller.abort()

    if (error !== undefined) {
      debug.error(error)

      if (this.#error === undefined) {
        this.#error = error
      }
    }

    this.#queueStream.call(async () => {
      debug.disposed(this.#contextId)

      this.#app.auth.removeListener('accessToken', this.#updateAccessToken)

      if (this.#websocket.state.status === 'open') {
        try {
          await this.#websocket.close()
        } catch (closeError) {
          debug.error(closeError)

          if (this.#error === undefined) {
            this.#error = ensureError(closeError)
          }
        }
      }

      if (this.#subscriptions.size > 0) {
        await Promise.allSettled(
          this.#subscriptions.entries().map(async ([referenceId, subscription]) => {
            try {
              await subscription.dispose()
            } catch (disposeError) {
              debug.error(subscription.constructor.name, referenceId, disposeError)

              if (this.#error === undefined) {
                this.#error = ensureError(disposeError)
              }
            }
          }),
        )

        this.#subscriptions.clear()
      }

      this.emit('disposed', this.#error)

      await super[Symbol.asyncDispose]()
    })
  }

  override [Symbol.asyncDispose](): Promise<void> {
    this.#dispose()

    return this.#queueStream.drain()
  }

  dispose(): Promise<void> {
    return this[Symbol.asyncDispose]()
  }

  #establishStream = (): void => {
    if (this.#state.status !== 'active' || this.#connecting === true) {
      return
    }

    this.#connecting = true

    this.#queueStream.call(async () => {
      try {
        while (true) {
          if (this.#state.status !== 'active') {
            return
          }

          try {
            await this.#websocket.reconnect({
              connect: {
                url: this.#websocketURL,
                signal: this.#signal,
              },
            })

            if (this.#subscriptions.size > 0) {
              for (const subscription of this.#subscriptions.values()) {
                subscription.subscribe()
              }
            }

            return
          } catch (error) {
            if (this.#app.auth.accessToken === undefined) {
              const methodName = 'authorize' as const

              await this.#app.auth[methodName]()

              if (this.#app.auth.accessToken === undefined) {
                throw new SaxoBankStreamError(
                  `Access token is not available. Unable to resolve access token with ${this.#app.auth.constructor.name}.${methodName}()`,
                )
              }

              continue
            }

            throw error
          }
        }
      } finally {
        this.#connecting = false
      }
    })
  }

  #updateAccessToken = (accessToken: string): void => {
    this.#queueAccessToken.call(async () => {
      if (this.#state.status !== 'active' || this.#websocket.state.status !== 'open') {
        return
      }

      const reauthorizingURL = new URL(SaxoBankApplicationConfig[this.#app.type].websocketReauthorizingURL)

      reauthorizingURL.searchParams.set('contextId', this.#contextId)

      try {
        await this.#app.http.put(reauthorizingURL, {
          headers: {
            Authorization: `BEARER ${accessToken}`,
          },
          // timeout: 30_000,
          signal: this.#signal,
        })
      } catch (error) {
        if (error instanceof HTTPClientRequestAbortError) {
          return
        }

        throw error
      }
    })
  }

  #websocketOpen = (): void => {
    this.#heartbeat()

    this.#app.auth.addListener('accessToken', this.#updateAccessToken, { persistent: true, sequential: true })
  }

  #websocketClose = (): void => {
    this.#app.auth.removeListener('accessToken', this.#updateAccessToken)

    this.#inactivityMonitor?.cancel()
    this.#inactivityMonitor = undefined

    this.#establishStream()
  }

  #websocketError = (event: Event): void => {
    if (
      'message' in event &&
      typeof event.message === 'string' &&
      event.message.toLowerCase().includes('connection reset')
    ) {
      return this.#establishStream()
    }

    this.#dispose(new WebSocketClientEventError({ event, url: this.#websocket.url }))
  }

  #websocketMessage = (event: MessageEvent): void => {
    this.#heartbeat()

    const messages = parseSaxoBankMessage(event.data)

    for (const message of messages) {
      this.#messageId = message.messageId

      switch (message.referenceId) {
        case '_heartbeat': {
          debug.message.heartbeat(this.#contextId, message.referenceId, message)

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
            const subscription = this.#subscriptions.get(OriginatingReferenceId)

            if (subscription === undefined) {
              continue
            }

            switch (Reason) {
              case 'NoNewData':
              case 'SubscriptionTemporarilyDisabled': {
                subscription.heartbeat()

                continue
              }

              case 'SubscriptionPermanentlyDisabled': {
                subscription.dispose().catch((error) => {
                  this.#dispose(ensureError(error))
                })

                continue
              }

              default: {
                continue
              }
            }
          }

          continue
        }

        case '_disconnect': {
          this.#establishStream()

          continue
        }

        case '_resetsubscriptions': {
          const [{ TargetReferenceIds }] = message.payload as [
            { ReferenceId: '_resetsubscriptions'; TargetReferenceIds: readonly string[] },
          ]

          debug.message.resetSubscriptions(
            this.#contextId,
            TargetReferenceIds.length === 0 ? 'all' : TargetReferenceIds,
          )

          if (TargetReferenceIds.length === 0) {
            for (const subscription of this.#subscriptions.values()) {
              subscription.subscribe()
            }
          } else {
            for (const [referenceId, subscription] of this.#subscriptions) {
              if (TargetReferenceIds.includes(referenceId) === false) {
                continue
              }

              subscription.subscribe()
            }
          }

          continue
        }

        default: {
          const subscription = this.#subscriptions.get(message.referenceId)

          if (subscription === undefined) {
            this.#queueStream.call(async () => {
              if (this.#state.status !== 'active') {
                return
              }

              try {
                await this.#app.rootServices.subscriptions.delete({
                  ContextId: this.#contextId,
                  Tag: message.referenceId,
                }, {
                  signal: this.#signal,
                  // timeout: 30_000,
                })
              } catch (error) {
                if (error instanceof HTTPClientRequestAbortError) {
                  return
                }

                throw error
              }
            })
            continue
          }

          try {
            debug.message.snapshot(this.#contextId, message.referenceId, message)

            subscription.receive(message.payload)
          } catch (error) {
            this.#dispose(ensureError(error))
          }

          continue
        }
      }
    }
  }

  #addSubscription = (
    // deno-lint-ignore no-explicit-any
    subscription: SaxoBankSubscription<any>,
    referenceId: string,
    previousReferenceId: undefined | string,
  ): void => {
    this.#queueStream.call(async () => {
      if (this.#state.status !== 'active') {
        await subscription.dispose()
        return
      }

      if (referenceId === previousReferenceId) {
        this.#dispose(new Error('The referenceId and previousReferenceId are the same and must be different.'))
        return
      }

      this.#subscriptions.set(referenceId, subscription)

      if (previousReferenceId !== undefined) {
        this.#subscriptions.delete(previousReferenceId)
      }

      if (this.#websocket.state.status === 'closed') {
        this.#establishStream()
      }

      if (debug.subscribed.enabled) {
        if (
          'options' in subscription &&
          typeof subscription.options === 'object' &&
          subscription.options !== null
        ) {
          debug.subscribed.apply(
            undefined,
            [
              this.#contextId,
              referenceId,
              ...Object.entries(subscription.options).map(([key, value]) => `${key}=${JSON.stringify(value)}`),
            ],
          )
        } else {
          debug.subscribed(this.#contextId, referenceId)
        }
      }
    })
  }

  // deno-lint-ignore no-explicit-any
  #removeSubscription = (subscription: SaxoBankSubscription<any>, referenceId: string) => {
    this.#queueStream.call(async () => {
      this.#subscriptions.delete(referenceId)

      subscription.removeListener('subscribed', this.#addSubscription)
      subscription.removeListener('disposed', this.#removeSubscription)

      if (this.#subscriptions.size === 0) {
        this.#inactivityMonitor?.cancel()
        this.#inactivityMonitor = undefined

        await this.#websocket.close()
      }

      if (
        debug.unsubscribed.enabled &&
        'options' in subscription &&
        typeof subscription.options === 'object' &&
        subscription.options !== null
      ) {
        debug.unsubscribed.apply(
          undefined,
          [
            this.#contextId,
            referenceId,
            ...Object.entries(subscription.options).map(([key, value]) => `${key}=${JSON.stringify(value)}`),
          ],
        )
      }
    })
  }

  // deno-lint-ignore no-explicit-any
  async #decorateSubscription<S extends SaxoBankSubscription<any>>(subscription: S): Promise<S> {
    subscription.addListener('subscribed', this.#addSubscription, { persistent: true })
    subscription.addListener('disposed', this.#removeSubscription, { persistent: true, once: true })

    await subscription.initialize()
    await this.#queueStream.drain()

    if (this.#state.status === 'failed') {
      throw this.#state.error
    }

    if (this.#state.status === 'disposed') {
      throw new SaxoBankStreamError('The SaxoBankStream is disposed.')
    }

    if (this.#websocket.state.status !== 'open') {
      throw new SaxoBankStreamError('The WebSocket connection is not open.')
    }

    return subscription
  }

  balance(options: ArgumentType<BalanceRequest>): Promise<SaxoBankSubscriptionBalance> {
    return this.#decorateSubscription(
      new SaxoBankSubscriptionBalance({
        stream: this,
        queue: this.#queueStream,
        options,
        signal: this.#signal,
      }),
    )
  }

  infoPrice<AssetType extends keyof InfoPriceSubscriptionOptions>(
    options: InfoPriceSubscriptionOptions[AssetType],
  ): Promise<SaxoBankSubscriptionInfoPrice<AssetType>> {
    return this.#decorateSubscription(
      new SaxoBankSubscriptionInfoPrice({
        stream: this,
        queue: this.#queueStream,
        options,
        signal: this.#signal,
      }),
    )
  }

  price<AssetType extends keyof PriceRequest>(
    options: ArgumentType<PriceRequest[AssetType]>,
  ): Promise<SaxoBankSubscriptionPrice<AssetType>> {
    return this.#decorateSubscription(
      new SaxoBankSubscriptionPrice<AssetType>({
        stream: this,
        queue: this.#queueStream,
        options,
        signal: this.#signal,
      }),
    )
  }

  orders(
    options: ArgumentType<OpenOrdersRequest>,
  ): SaxoBankSubscriptionOrders {
    return this.#decorateSubscription(
      new SaxoBankSubscriptionOrders({
        stream: this,
        queue: this.#queueStream,
        options,
        signal: this.#signal,
      }),
    )
  }
}
