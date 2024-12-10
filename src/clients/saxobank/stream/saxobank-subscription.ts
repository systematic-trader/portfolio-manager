import { AssertionError } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ensureError } from '../../../utils/error.ts'
import { EventSwitch } from '../../../utils/event-switch.ts'
import type { PromiseQueue } from '../../../utils/promise-queue.ts'
import { mergeAbortSignals } from '../../../utils/signal.ts'
import { Timeout } from '../../../utils/timeout.ts'
import type { SaxoBankApplication } from '../../saxobank-application.ts'
import type { SaxoBankStream } from '../../saxobank-stream.ts'

export interface SaxoBankSubscriptionParse<Message> {
  (previous: Message, payload: unknown): ReadonlyArray<Message>
}

export interface SaxoBankSubscriptionCreateReferenceId {
  (): string
}

export interface SaxoBankSubscriptionSubscribe<Message> {
  (
    { app, contextId, referenceId, previousReferenceId, timeout, signal }: {
      readonly app: SaxoBankApplication
      readonly contextId: string
      readonly referenceId: string
      readonly previousReferenceId?: undefined | string
      readonly timeout?: undefined | number
      readonly signal?: undefined | AbortSignal
    },
  ): Promise<{
    readonly referenceId: string
    readonly message: Message
    readonly inactivityTimeout: number
  }>
}

export interface SaxoBankSubscriptionUnsubscribe {
  (
    { app, contextId, referenceId, timeout, signal }: {
      readonly app: SaxoBankApplication
      readonly contextId: string
      readonly referenceId: string
      readonly timeout?: undefined | number
      readonly signal?: undefined | AbortSignal
    },
  ): Promise<void>
}

export class SaxoBankSubscriptionPayloadError extends Error {
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

export class SaxoBankSubscription<Message> extends EventSwitch<{
  // dispose: [error?: undefined | Error] - should be a method on the class
  disposed: [subscription: SaxoBankSubscription<Message>, referenceId: string]
  // heartbeat: [] - should be a method on the class
  inactivity: [subscription: SaxoBankSubscription<Message>, referenceId: string]
  message: [message: Message]
  // subscribe: [] - should be a method on the class
  subscribed: [
    subscription: SaxoBankSubscription<Message>,
    referenceId: string,
    previousReferenceId?: undefined | string,
  ]
  // payload: [payload: unknown] - should be a method on the class
}> implements AsyncDisposable {
  readonly #stream: SaxoBankStream
  readonly #controller = new AbortController()
  readonly #queue: PromiseQueue

  readonly #handle: {
    readonly parse: SaxoBankSubscriptionParse<Message>
    readonly createReferenceId: SaxoBankSubscriptionCreateReferenceId
    readonly subscribe: SaxoBankSubscriptionSubscribe<Message>
    readonly unsubscribe: SaxoBankSubscriptionUnsubscribe
  }

  #referenceId: undefined | string
  #inactivityMonitor: undefined | Timeout<void>
  #inactivityTimeout: number
  #error: undefined | Error
  #message: undefined | Message
  #state: this['state']

  get state(): {
    readonly status: 'active' | 'disposed'
    readonly error: undefined
  } | {
    readonly status: 'failed'
    readonly error: Error
  } {
    return this.#state
  }

  constructor(options: {
    readonly stream: SaxoBankStream
    readonly queue: PromiseQueue
    readonly parse: SaxoBankSubscriptionParse<Message>
    readonly createReferenceId: SaxoBankSubscriptionCreateReferenceId
    readonly subscribe: SaxoBankSubscriptionSubscribe<Message>
    readonly unsubscribe: SaxoBankSubscriptionUnsubscribe
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  }) {
    const queue = options.queue.createNested((error) => this.dispose(error))

    super(queue.createNested())

    this.#queue = queue

    const { stream, createReferenceId, parse, subscribe, unsubscribe } = options

    this.#stream = stream

    this.#handle = {
      parse,
      createReferenceId,
      subscribe,
      unsubscribe,
    }

    this.#referenceId = undefined
    this.#inactivityTimeout = -1
    this.#inactivityMonitor = undefined
    this.#error = undefined

    // deno-lint-ignore no-this-alias
    const self = this

    this.#state = {
      get status() {
        if (self.#error !== undefined) {
          return 'failed'
        }

        if (self.#controller.signal.aborted || self.#stream.state.status !== 'active') {
          return 'disposed'
        }

        return 'active'
      },
      get error() {
        return self.#error
      },
    } as this['state']

    if (options.signal?.aborted === true) {
      this.#controller.abort()
      return
    }

    this.subscribe({ signal: options.signal, timeout: options.timeout })
  }

  async [Symbol.asyncDispose](): Promise<void> {
    this.dispose()

    await this.#queue.drain()
  }

  dispose(error?: undefined | Error): void {
    if (this.#state.status !== 'active') {
      return
    }

    if (error !== undefined && error !== null && this.#error === undefined) {
      this.#error = error
    }

    this.#controller.abort()
    this.#inactivityMonitor?.cancel()
    this.#inactivityMonitor = undefined

    if (this.#referenceId !== undefined) {
      const referenceId = this.#referenceId

      this.#queue.call(async () => {
        if (this.#stream.state.status === 'active') {
          try {
            await this.#handle.unsubscribe({
              app: this.#stream.app,
              contextId: this.#stream.contextId,
              referenceId,
              timeout: 5_000,
            })
          } catch (error) {
            if (this.#error === undefined) {
              this.#error = ensureError(error)
            }
          } finally {
            this.emit('disposed', this, referenceId)
          }
        }
      })

      this.#queue.unnest()
    }
  }

  subscribe(
    { timeout, signal }: { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal } = {},
  ): void {
    if (this.#state.status !== 'active') {
      return
    }

    this.#queue.call(async () => {
      if (this.#state.status !== 'active') {
        return
      }

      let response: undefined | Awaited<ReturnType<SaxoBankSubscriptionSubscribe<Message>>> = undefined

      const referenceId = this.#handle.createReferenceId()
      const previousReferenceId = this.#referenceId

      try {
        if (previousReferenceId === undefined) {
          response = await this.#handle.subscribe({
            app: this.#stream.app,
            contextId: this.#stream.contextId,
            referenceId,
            timeout,
            signal: mergeAbortSignals(signal, this.#controller.signal),
          })
        } else {
          response = await this.#handle.subscribe({
            app: this.#stream.app,
            contextId: this.#stream.contextId,
            referenceId,
            previousReferenceId,
            timeout,
            signal: mergeAbortSignals(signal, this.#controller.signal),
          })
        }

        if (this.#state.status !== 'active') {
          return
        }

        this.#referenceId = response.referenceId
        this.#inactivityTimeout = response.inactivityTimeout
        this.#message = response.message

        if (this.#referenceId === previousReferenceId) {
          this.emit('subscribed', this, this.#referenceId)
        } else {
          this.emit('subscribed', this, this.#referenceId, previousReferenceId)
        }

        this.emit('message', this.#message)
      } catch (error) {
        if (error instanceof AssertionError) {
          return this.dispose(
            new SaxoBankSubscriptionPayloadError(referenceId, error.input, error.invalidations),
          )
        }

        return this.dispose(ensureError(error))
      }
    })
  }

  heartbeat(): void {
    if (this.#state.status !== 'active' || this.#referenceId === undefined) {
      return
    }

    this.#inactivityMonitor?.cancel()
    this.#inactivityMonitor = undefined

    if (this.#inactivityTimeout > 0) {
      this.#inactivityMonitor = Timeout.defer(this.#inactivityTimeout, () => {
        if (this.#state.status !== 'active') {
          return
        }

        this.emit('inactivity', this, this.#referenceId!)
      })
    }
  }

  receive(payload: unknown): void {
    if (this.#state.status !== 'active') {
      return
    }

    this.heartbeat()

    if (this.#message === undefined) {
      throw new Error('Subscribe before emitting payload')
    }

    try {
      const messages = this.#handle.parse(this.#message, payload)

      for (const newMessage of messages) {
        this.emit('message', newMessage)
        this.#message = newMessage
      }
    } catch (error) {
      if (error instanceof AssertionError) {
        return this.dispose(new SaxoBankSubscriptionPayloadError(this.#referenceId!, payload, error.invalidations))
      }

      return this.dispose(ensureError(error))
    }
  }
}
