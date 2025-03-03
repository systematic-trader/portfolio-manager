import { AssertionError } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { EventSwitch } from '../../../utils/event-switch.ts'
import type { PromiseQueue } from '../../../utils/promise-queue.ts'
import { CombinedSignalController } from '../../../utils/signal.ts'
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
  disposed: [subscription: SaxoBankSubscription<Message>, referenceId: string]
  message: [message: Message]
  subscribed: [
    subscription: SaxoBankSubscription<Message>,
    referenceId: string,
    previousReferenceId?: undefined | string,
  ]
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

  #referenceId: string
  #inactivityMonitor: undefined | Timeout<void>
  #inactivityTimeout: number
  #message: undefined | Message

  get message(): Message {
    if (this.#message === undefined) {
      throw new Error('Call initialize() before accessing message')
    }

    return this.#message
  }

  get status(): 'active' | 'disposed' {
    if (this.#controller.signal.aborted || this.#stream.state.status !== 'active') {
      return 'disposed'
    }

    return 'active'
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
    const queue = options.queue.createNested()

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

    this.#referenceId = options.createReferenceId()
    this.#inactivityTimeout = -1
    this.#inactivityMonitor = undefined

    if (options.signal?.aborted === true) {
      this.#controller.abort()
      return
    }

    this.subscribe({ signal: options.signal, timeout: options.timeout })
  }

  // [Symbol.asyncIterator](): AsyncIterator<Message, undefined, undefined> {
  //   // We'll keep a simple FIFO queue of messages
  //   const messageQueue: Message[] = []
  //   // Resolvers awaiting the next message
  //   const pendingResolvers: Array<(value: IteratorResult<Message, undefined>) => void> = []

  //   // Handle the arrival of a new message:
  //   const onMessage = (newMessage: Message) => {
  //     const nextResolver = pendingResolvers.shift()

  //     if (nextResolver === undefined) {
  //       // Push onto the queue
  //       messageQueue.push(newMessage)
  //     } else {
  //       // If we have a resolver waiting for the next message, resolve immediately
  //       return nextResolver({ value: newMessage, done: false })
  //     }
  //   }

  //   // Handle disposal or failure:
  //   const onDisposed = () => {
  //     // If we failed, we want subsequent iteration calls to reject.
  //     // If simply disposed, we want them to complete with `done: true`.

  //     while (pendingResolvers.length > 0) {
  //       const nextResolver = pendingResolvers.shift()!
  //       if (this.state.status === 'failed') {
  //         // Reject by throwing the error inside the async iterator
  //         // (i.e., next() => Promise.reject(...))
  //         // There's no direct standard way to "throw" an error from here
  //         // but we can resolve with a done: true and store a symbol error
  //         // or adopt the recommended approach: "return a special done object"
  //         // that the consumer can interpret. Another approach is to do:
  //         nextResolver(Promise.reject(this.state.error) as never)
  //       } else {
  //         // Gracefully end iteration
  //         nextResolver({ value: undefined, done: true })
  //       }
  //     }
  //   }

  //   // Begin listening for 'message' and 'disposed' events:
  //   this.addListener('message', onMessage, { persistent: true })
  //   this.addListener('disposed', onDisposed, { persistent: true, once: true })

  //   return {
  //     next: async (): Promise<IteratorResult<Message, undefined>> => {
  //       const nextMessage = messageQueue.shift()

  //       // If there's something in the queue, return it immediately
  //       if (nextMessage !== undefined) {
  //         return { value: nextMessage, done: false }
  //       }

  //       // If the subscription is failed, reject immediately
  //       if (this.state.status === 'failed') {
  //         return Promise.reject(this.state.error)
  //       }

  //       // If the subscription is disposed, end immediately
  //       if (this.state.status === 'disposed') {
  //         return { value: undefined, done: true }
  //       }

  //       const { promise, resolve } = Promise.withResolvers<IteratorResult<Message, undefined>>()

  //       pendingResolvers.push(resolve)

  //       return await promise
  //     },

  //     // deno-lint-ignore require-await
  //     return: async (): Promise<IteratorResult<Message, undefined>> => {
  //       // Called if the consumer breaks out of the for-await-of loop
  //       // or otherwise ends iteration early
  //       this.removeListener('message', onMessage)
  //       this.removeListener('disposed', onDisposed)

  //       // Clear out pending resolvers so we don't leak them
  //       for (let i = 0; i < pendingResolvers.length; i++) {
  //         const resolver = pendingResolvers[i]!

  //         resolver({ value: undefined, done: true })
  //       }

  //       pendingResolvers.length = 0

  //       return { value: undefined, done: true }
  //     },
  //     // `throw` is optional for async iterators, but we can implement if we want:
  //     throw: (error?: unknown): Promise<IteratorResult<Message, undefined>> => {
  //       this.removeListener('message', onMessage)
  //       this.removeListener('disposed', onDisposed)

  //       const rejection = Promise.reject(error) as never

  //       if (pendingResolvers.length > 0) {
  //         // Clear out pending resolvers so we don't leak them
  //         for (let i = 0; i < pendingResolvers.length; i++) {
  //           const resolver = pendingResolvers[i]!

  //           resolver(rejection)
  //         }

  //         pendingResolvers.length = 0
  //       }

  //       return rejection
  //     },
  //   }
  // }

  override [Symbol.asyncDispose](): Promise<void> {
    if (this.#inactivityMonitor !== undefined) {
      this.#inactivityMonitor.cancel()
      this.#inactivityMonitor = undefined
    }

    if (this.#controller.signal.aborted) {
      return this.#queue.drain()
    }

    this.#controller.abort()

    this.#queue.call(async () => {
      if (this.#stream.state.status === 'active') {
        await this.#handle.unsubscribe({
          app: this.#stream.app,
          contextId: this.#stream.contextId,
          referenceId: this.#referenceId,
          timeout: 5_000,
        })
      }

      this.emit('disposed', this, this.#referenceId)

      await super[Symbol.asyncDispose]()
    })

    this.#queue.unnest()

    return this.#queue.drain()
  }

  dispose(): Promise<void> {
    return this[Symbol.asyncDispose]()
  }

  async initialize(): Promise<this> {
    if (this.#message !== undefined) {
      return this
    }

    if (this.status === 'disposed') {
      throw new Error(`${this.constructor.name} disposed before message was received.`)
    }

    const { promise, resolve, reject } = Promise.withResolvers<void>()

    const onMessage: () => void = (): void => {
      this.removeListener('disposed', onDisposed)

      resolve()
    }

    const onDisposed = () => {
      this.removeListener('message', onMessage)

      reject(new Error(`${this.constructor.name} disposed before message was received.`))
    }

    this.addListener('message', onMessage, { persistent: true, once: true })
    this.addListener('disposed', onDisposed, { persistent: true, once: true })

    await promise

    return this
  }

  subscribe(
    { timeout, signal }: { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal } = {},
  ): void {
    if (this.#controller.signal.aborted) {
      return
    }

    this.#queue.call(async () => {
      if (this.status !== 'active') {
        return
      }

      let response: undefined | Awaited<ReturnType<SaxoBankSubscriptionSubscribe<Message>>> = undefined

      try {
        let previousReferenceId: undefined | string = undefined

        if (this.#message === undefined) {
          response = await this.#handle.subscribe({
            app: this.#stream.app,
            contextId: this.#stream.contextId,
            referenceId: this.#referenceId,
            timeout,
            signal: new CombinedSignalController(signal, this.#controller.signal).signal,
          })
        } else {
          previousReferenceId = this.#referenceId
          this.#referenceId = this.#handle.createReferenceId()

          response = await this.#handle.subscribe({
            app: this.#stream.app,
            contextId: this.#stream.contextId,
            referenceId: this.#referenceId,
            previousReferenceId,
            timeout,
            signal: new CombinedSignalController(signal, this.#controller.signal).signal,
          })
        }

        this.#referenceId = response.referenceId
        this.#inactivityTimeout = response.inactivityTimeout
        this.#message = response.message

        if (previousReferenceId === undefined) {
          this.emit('subscribed', this, this.#referenceId)
        } else {
          this.emit('subscribed', this, this.#referenceId, previousReferenceId)
        }

        this.emit('message', this.#message)
      } catch (error) {
        this.#queue.call(this.dispose.bind(this))

        if (error instanceof AssertionError) {
          throw new SaxoBankSubscriptionPayloadError(this.#referenceId, error.input, error.invalidations)
        }

        throw error
      }
    })
  }

  heartbeat(): void {
    if (this.status !== 'active') {
      return
    }

    this.#inactivityMonitor?.cancel()
    this.#inactivityMonitor = undefined

    if (this.#inactivityTimeout > 0) {
      this.#inactivityMonitor = Timeout.defer(this.#inactivityTimeout, () => {
        if (this.status !== 'active') {
          return
        }

        this.subscribe()
      })
    }
  }

  receive(payload: unknown): void {
    if (this.status !== 'active') {
      return
    }

    this.heartbeat()

    try {
      if (this.#message === undefined) {
        throw new Error('Subscribe before emitting payload')
      }

      const messages = this.#handle.parse(this.#message, payload)

      for (const newMessage of messages) {
        this.emit('message', newMessage)
        this.#message = newMessage
      }
    } catch (error) {
      this.#queue.call(this.dispose.bind(this))

      if (error instanceof AssertionError) {
        this.#queue.addError(
          new SaxoBankSubscriptionPayloadError(this.#referenceId as string, payload, error.invalidations),
        )
      } else {
        this.#queue.addError(error)
      }
    }
  }
}
