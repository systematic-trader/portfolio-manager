export class Timeout<T = undefined> extends Promise<undefined | T> implements Disposable {
  /** The default value for unref. `true` by default and will unref the timer */
  static unref = true

  /** Create a timeout that resolves after a certain amount of time */
  static wait(timeout: number): Timeout<void> {
    return this.#create<void>(timeout)
  }

  /** Create a timeout that resolves with a value after a certain amount of time */
  static defer<T>(timeout: number, deferred: (signal: AbortSignal) => T | Promise<T>): Timeout<T> {
    return this.#create<T>(timeout, deferred)
  }

  /** Create a timeout that resolves with a value within a certain amount of time */
  static run<T>(timeout: number, handle: (signal: AbortSignal) => T | Promise<T>): Timeout<T> {
    const instance = this.#create<T>(timeout)

    try {
      const maybePromise = handle(instance.signal)

      if (maybePromise instanceof Promise) {
        maybePromise.then(instance.#resolve).catch(instance.#reject)
      } else {
        instance.#resolve(maybePromise)
      }
    } catch (error) {
      instance.#reject(error)
    }

    return instance
  }

  static repeat(
    timeout: number,
    handle: (signal: AbortSignal) => void | Promise<void>,
    iterations?: undefined | number,
  ): Timeout<void> {
    const instance = this.#create<void>(0, async (signal) => {
      let wait: undefined | Timeout<void> = undefined

      const listener = () => {
        wait?.abort()
        signal.removeEventListener('abort', listener)
      }

      signal.addEventListener('abort', listener)

      while (signal.aborted === false) {
        if (iterations !== undefined && iterations-- === 0) {
          break
        }

        try {
          await handle(signal)
        } catch (error) {
          instance.#reject(error)
        }

        wait = Timeout.wait(timeout)

        try {
          await wait
        } finally {
          wait = undefined
        }
      }
    })

    return instance
  }

  #status: 'in-progress' | 'fulfilled' | 'rejected' | 'aborted' | 'cancelled' = 'in-progress'

  get status(): 'in-progress' | 'fulfilled' | 'rejected' | 'aborted' | 'cancelled' {
    return this.#status
  }

  #controller: undefined | AbortController

  get signal(): AbortSignal {
    if (this.#controller === undefined) {
      const controller = new AbortController()

      if (this.#status !== 'in-progress' && (this.#status === 'rejected' || this.#status === 'aborted')) {
        controller.abort()
      } else {
        const listener = () => {
          if (this.#status === 'in-progress') {
            this.#status = 'aborted'
          }

          this.#resolve(undefined as T)

          controller.signal.removeEventListener('abort', listener)
        }

        controller.signal.addEventListener('abort', listener)
      }

      this.#controller = controller
    }

    return this.#controller.signal
  }

  #resolve!: (value: undefined | T) => void
  #reject!: (reason: unknown) => void
  #timer!: number

  static #create<T = undefined>(
    timeout: number,
    handle?: undefined | ((signal: AbortSignal) => T | Promise<T>),
    unref: undefined | boolean = Timeout.unref,
  ): Timeout<T> {
    let promiseResolve!: (value: undefined | T) => void
    let promiseReject!: (reason: unknown) => void

    const instance = new Timeout<T>((resolve, reject) => {
      promiseResolve = resolve
      promiseReject = reject
    })

    instance.#resolve = (value: undefined | T): void => {
      clearTimeout(instance.#timer)

      if (instance.#status === 'in-progress') {
        instance.#status = 'fulfilled'
      }

      promiseResolve(value)

      if (
        instance.#controller !== undefined && instance.#controller.signal.aborted === false &&
        instance.#status === 'aborted'
      ) {
        instance.#controller.abort()
      }
    }

    instance.#reject = (reason: unknown): void => {
      clearTimeout(instance.#timer)

      if (instance.#status === 'in-progress') {
        instance.#status = 'rejected'
      }

      promiseReject(reason)

      if (
        instance.#controller !== undefined && instance.#controller.signal.aborted === false &&
        (instance.#status === 'rejected' || instance.#status === 'aborted')
      ) {
        instance.#controller.abort()
      }
    }

    const handler: TimerHandler = handle === undefined
      ? () => {
        if (instance.#status === 'in-progress') {
          instance.#status = 'aborted'
        }

        instance.#resolve(undefined as T)
      }
      : () => {
        if (instance.#status !== 'in-progress') {
          return instance.#resolve(undefined as T)
        }

        try {
          const maybePromise = handle(instance.signal)

          if (maybePromise instanceof Promise) {
            maybePromise.then(instance.#resolve).catch(instance.#reject)
          } else {
            instance.#resolve(maybePromise)
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            if (instance.#status === 'in-progress') {
              instance.#status = 'aborted'
            }

            return instance.#resolve(undefined)
          }

          instance.#reject(error)
        }
      }

    instance.#timer = setTimeout(handler, timeout)

    return unref ? instance.unref() : instance
  }

  protected constructor(
    executor: (resolve: (value: undefined | T) => void, reject: (reason: unknown) => void) => void,
  ) {
    super(executor)
  }

  [Symbol.dispose](): void {
    this.cancel()
  }

  /**
   * Abort the timeout by emitting 'abort' to its signal and resolving to undefined or rejecting with the given reason
   * @param reason The reason for aborting the timeout
   */
  abort(reason?: unknown): void {
    if (reason === undefined) {
      if (this.#status === 'in-progress') {
        this.#status = 'aborted'
      }
      this.#resolve(undefined as T)
    } else {
      this.#reject(reason)
    }
  }

  /** Cancel the timeout by resolving to undefined */
  cancel(): void {
    if (this.#status === 'in-progress') {
      this.#status = 'cancelled'
    }

    this.#resolve(undefined as T)
  }

  /** Unref the timer */
  unref(): this {
    Deno.unrefTimer(this.#timer)

    return this
  }
}
