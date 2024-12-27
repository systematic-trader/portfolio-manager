// deno-lint-ignore-file no-explicit-any
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
import { SaxoBankSubscriptionPrice } from './saxobank/stream/subscriptions/saxobank-subscription-price.ts'
import type { BalanceRequest } from './saxobank/types/records/balance-request.ts'
import type { PriceRequest } from './saxobank/types/records/price-request.ts'
import { WebSocketClient, WebSocketClientEventError } from './websocket-client.ts'

const debug = {
  subscribed: Debug('stream:subscribed'),
  unsubscribed: Debug('stream:unsubscribed'),
  heartbeat: Debug('stream:heartbeat'),
  socketError: Debug('stream:socket-error'),
  disconnect: Debug('stream:disconnect'),
  reconnect: Debug('stream:reconnect'),
  disposed: Debug('stream:disposed'),
  resetSubscriptions: Debug('stream:reset-subscriptions'),
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

export class SaxoBankStreamDisposedError extends SaxoBankStreamError {
  readonly contextId: string

  constructor({ contextId }: { readonly contextId: string }) {
    super('SaxoBankStream is disposed.')
    this.contextId = contextId
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
  readonly #subscriptions = new Map<string, SaxoBankSubscription<any>>()
  readonly #socket: WebSocketClient
  readonly #queueMain: PromiseQueue
  readonly #queueAccessToken: PromiseQueue
  readonly #queueServiceGroup: PromiseQueue
  readonly #contextId = SaxoBankRandom.stream.contextId()
  readonly #controller = new AbortController()
  readonly #signal: AbortSignal

  #disposed: boolean
  #connecting: boolean
  #inactivityMonitor: undefined | Timeout<void>
  #error: undefined | Error
  #state: this['state']
  #messageId: number

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
    readonly connecting: boolean
    readonly error: undefined
  } | {
    readonly status: 'disposed'
    readonly connecting: false
    readonly error: undefined
  } | {
    readonly status: 'failed'
    readonly connecting: false
    readonly error: Error
  } {
    return this.#state
  }

  get #url(): string {
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

    this.#queueMain = queue
    this.#queueAccessToken = queue.createNested()
    this.#queueServiceGroup = queue.createNested()

    this.#app = app
    this.#disposed = false
    this.#connecting = false
    this.#error = undefined
    this.#messageId = 0
    this.#inactivityTimeout = inactivityTimeout
    this.#inactivityMonitor = undefined

    this.#socket = new WebSocketClient({ url: this.#url, binaryType: 'arraybuffer' })
    this.#socket.addListener('open', this.#socketOpen)
    this.#socket.addListener('close', this.#socketClose)
    this.#socket.addListener('error', this.#socketError)
    this.#socket.addListener('message', this.#socketMessage)

    // deno-lint-ignore no-this-alias
    const self = this

    this.#state = {
      get status() {
        if (self.#error !== undefined || self.#socket.state.status === 'failed') {
          return 'failed'
        }

        if (self.#disposed || self.#controller.signal.aborted) {
          return 'disposed'
        }

        return 'active'
      },

      get error() {
        return self.#error ?? self.#socket.state.error
      },
    } as this['state']

    this.#signal = mergeAbortSignals(this.#controller.signal, signal) ?? this.#controller.signal

    if (this.#signal.aborted === true) {
      this.#controller.abort()
      return
    }

    if (this.#signal !== undefined) {
      this.#signal.addEventListener('abort', this.dispose.bind(this, undefined), { once: true })
    }

    app.auth.addListener('accessToken', this.#updateAccessToken, { persistent: true, sequential: true })
  }

  #heartbeat(): void {
    if (this.#state.status !== 'active') {
      return
    }

    this.#inactivityMonitor?.cancel()
    this.#inactivityMonitor = Timeout.defer(this.#inactivityTimeout, this.#reconnectSubscriptions)
  }

  #updateAccessToken = (accessToken: string): void => {
    if (this.#state.status !== 'active') {
      this.#app.auth.removeListener('accessToken', this.#updateAccessToken)
      return
    }

    if (this.#socket.state.status !== 'open') {
      return
    }

    this.#queueAccessToken.call(async () => {
      if (this.#state.status !== 'active' || this.#socket.state.status !== 'open') {
        return
      }

      const reauthorizingURL = new URL(SaxoBankApplicationConfig[this.#app.type].websocketReauthorizingURL)

      reauthorizingURL.searchParams.set('contextId', this.#contextId)

      try {
        await this.#app.http.put(reauthorizingURL, {
          headers: {
            Authorization: `BEARER ${accessToken}`,
          },
          timeout: 5_000,
          signal: this.#signal,
        })
      } catch (error) {
        if (error instanceof HTTPClientRequestAbortError) {
          return
        }

        throw error
      }
    })
  };

  [Symbol.asyncDispose](): Promise<void> {
    this.dispose()

    return this.#queueMain.drain()
  }

  async #dispose(error?: undefined | Error): Promise<void> {
    if (this.#state.status !== 'active') {
      return
    }

    this.#disposed = true

    if (error !== undefined && error !== null) {
      this.#error = error
    }

    try {
      this.#controller.abort()
      this.#inactivityMonitor?.cancel()
      this.#inactivityMonitor = undefined

      let closeWebSocketPromise: undefined | Promise<void> = undefined

      if (this.#socket.state.status === 'open') {
        closeWebSocketPromise = this.#socket.close()
      }

      const deleteContextPromise = this.#app.rootServices.subscriptions.delete({
        ContextId: this.#contextId,
      }, {
        timeout: 5_000,
      }).catch((deleteContextError) => {
        if (deleteContextError instanceof HTTPClientRequestAbortError) {
          return
        }

        throw deleteContextError
      })

      if (this.#subscriptions.size > 0) {
        for (const subscription of this.#subscriptions.values()) {
          subscription.dispose()
        }
      }

      for (const promiseSettled of await Promise.allSettled([closeWebSocketPromise, deleteContextPromise])) {
        if (promiseSettled.status === 'rejected') {
          // overwrite with the latest error
          this.#error = ensureError(promiseSettled.reason)
        }
      }

      this.emit('disposed', this.#error)
    } catch (uncaughtError) {
      this.#error = ensureError(uncaughtError)
    } finally {
      debug.disposed(this.#contextId)
    }
  }

  dispose(error?: undefined | Error): void {
    this.#queueMain.add(this.#dispose(error))
  }

  #ensureWebSocket(reconnect: undefined | boolean = false): void {
    if (this.#connecting || this.#state.status !== 'active') {
      return
    }

    this.#connecting = true

    this.#queueMain.call(async () => {
      let retries = 0

      try {
        while (true) {
          if (this.#state.status !== 'active') {
            return
          }

          try {
            if (reconnect) {
              await this.#socket.reconnect({
                connect: {
                  url: this.#url,
                  timeout: 5_000,
                  signal: this.#signal,
                },
              })

              for (const subscription of this.#subscriptions.values()) {
                subscription.subscribe({ signal: this.#signal, timeout: 5_000 })
              }
            } else {
              if (this.#socket.state.status === 'open') {
                return
              }

              await this.#socket.connect({
                url: this.#url,
                timeout: 5_000,
                signal: this.#signal,
              })
            }
          } catch {
            if (this.#app.auth.accessToken === undefined) {
              const methodName = 'authorize' as const

              // Wait for the access token to be updated
              await this.#app.auth[methodName]()

              if (this.#app.auth.accessToken === undefined) {
                throw new SaxoBankStreamError(
                  `Access token is not available. Unable to resolve access token with ${this.#app.auth.constructor.name}.${methodName}()`,
                )
              }

              continue
            }

            // Wait for up to 5 seconds before retrying
            let countdown = Math.min(50, retries * 10)
            while (countdown > 0 && this.#subscriptions.size > 0 && this.#state.status === 'active') {
              await Timeout.wait(100)

              countdown--
            }

            continue
          } finally {
            retries++
          }

          break
        }
      } finally {
        this.#connecting = false
      }
    })
  }

  #socketOpen = (_event: Event): void => {
    this.#heartbeat()

    this.#app.auth.addListener('accessToken', this.#updateAccessToken)
  }

  #socketClose = (_event: CloseEvent): void => {
    this.#app.auth.removeListener('accessToken', this.#updateAccessToken)

    this.#inactivityMonitor?.cancel()
    this.#inactivityMonitor = undefined
  }

  #socketError = (event: Event): void => {
    debug.socketError(this.#contextId, event)

    if (
      'message' in event &&
      typeof event.message === 'string' &&
      event.message.toLowerCase().includes('connection reset')
    ) {
      return this.#reconnectSubscriptions()
    }

    const error = new WebSocketClientEventError({ event, url: this.#url })

    this.dispose(error)
  }

  #socketMessage = (event: MessageEvent): void => {
    this.#heartbeat()

    const messages = parseSaxoBankMessage(event.data)

    for (const message of messages) {
      this.#messageId = message.messageId

      switch (message.referenceId) {
        case '_heartbeat': {
          debug.heartbeat(this.#contextId, message.referenceId, message)

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
                subscription.dispose()

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
          this.#reconnectSubscriptions()

          continue
        }

        case '_resetsubscriptions': {
          const [{ TargetReferenceIds }] = message.payload as [
            { ReferenceId: '_resetsubscriptions'; TargetReferenceIds: readonly string[] },
          ]

          debug.resetSubscriptions(this.#contextId, TargetReferenceIds.length === 0 ? 'all' : TargetReferenceIds)

          if (TargetReferenceIds.length === 0) {
            if (this.#subscriptions.size === 0) {
              this.#queueMain.add(this.#socket.close())
            } else {
              for (const subscription of this.#subscriptions.values()) {
                subscription.subscribe()
              }
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
            this.#queueServiceGroup.call(async () => {
              if (this.#state.status !== 'active') {
                return
              }

              try {
                await this.#app.rootServices.subscriptions.delete({
                  ContextId: this.#contextId,
                  Tag: message.referenceId,
                }, {
                  signal: this.#signal,
                  timeout: 5_000,
                })
              } catch (error) {
                if (error instanceof HTTPClientRequestAbortError) {
                  return
                }

                throw error
              }
            }, {
              immediately: true,
            })
            continue
          }

          subscription.receive(message.payload)

          continue
        }
      }
    }
  }

  #addSubscription = (
    subscription: SaxoBankSubscription<any>,
    referenceId: string,
    previousReferenceId: undefined | string,
  ) => {
    if (this.#state.status !== 'active') {
      return subscription.dispose()
    }

    if (referenceId === previousReferenceId) {
      return subscription.dispose(
        new Error('The referenceId and previousReferenceId are the same and must be different.'),
      )
    }

    this.#subscriptions.set(referenceId, subscription)

    if (previousReferenceId !== undefined) {
      this.#subscriptions.delete(previousReferenceId)
    }

    if (this.#subscriptions.size === 1 && this.#socket.state.status === 'closed') {
      this.#ensureWebSocket()
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
  }

  #reconnectSubscriptions = () => {
    if (this.#state.status === 'active' && this.#subscriptions.size > 0) {
      this.#ensureWebSocket(true)
      debug.reconnect(this.#contextId)
    } else {
      debug.disconnect(this.#contextId)
    }
  }

  #disposeSubscription = (subscription: SaxoBankSubscription<any>, referenceId: string) => {
    this.#subscriptions.delete(referenceId)

    // if (this.#subscriptions.size === 0) {
    //   this.#inactivityMonitor?.cancel()
    //   this.#inactivityMonitor = undefined
    // }

    subscription.removeListener('subscribed', this.#addSubscription)
    subscription.removeListener('inactivity', this.#reconnectSubscriptions)
    subscription.removeListener('disposed', this.#disposeSubscription)

    if (this.#subscriptions.size === 0) {
      this.#queueMain.call(() => this.#socket.close())
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
  }

  #decorateSubscription<S extends SaxoBankSubscription<any>>(subscription: S): S {
    subscription.addListener('subscribed', this.#addSubscription, { persistent: true })
    subscription.addListener('inactivity', this.#reconnectSubscriptions, { persistent: true })
    subscription.addListener('disposed', this.#disposeSubscription, { persistent: true, once: true })

    return subscription
  }

  balance(options: ArgumentType<BalanceRequest>): SaxoBankSubscriptionBalance {
    return this.#decorateSubscription(
      new SaxoBankSubscriptionBalance({
        stream: this,
        queue: this.#queueMain,
        options,
        signal: this.#signal,
      }),
    )
  }

  infoPrice<AssetType extends keyof InfoPriceSubscriptionOptions>(
    options: InfoPriceSubscriptionOptions[AssetType],
  ): SaxoBankSubscriptionInfoPrice<AssetType> {
    return this.#decorateSubscription(
      new SaxoBankSubscriptionInfoPrice({
        stream: this,
        queue: this.#queueMain,
        options,
        signal: this.#signal,
      }),
    )
  }

  price<AssetType extends keyof PriceRequest>(
    options: ArgumentType<PriceRequest[AssetType]>,
  ): SaxoBankSubscriptionPrice<AssetType> {
    return this.#decorateSubscription(
      new SaxoBankSubscriptionPrice<AssetType>({
        stream: this,
        queue: this.#queueMain,
        options,
        signal: this.#signal,
      }),
    )
  }
}
