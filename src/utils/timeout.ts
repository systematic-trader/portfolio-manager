import { ensureError } from './error.ts'

export class Timeout<T = undefined> extends Promise<undefined | T> implements Disposable {
  /** The default value for unref. `true` by default and will unref the timer */
  static unref = true

  /** Create a timeout that resolves after a certain amount of time */
  static wait(timeout: number): Timeout<void> {
    return this.#create<void>(timeout)
  }

  /** Create a timeout that after a certain amount of time calls the function and resolves with its return value.  */
  static defer<T>(timeout: number, deferred: (this: Timeout<T>, signal: AbortSignal) => T | Promise<T>): Timeout<T> {
    return this.#create<T>(timeout, deferred)
  }

  /** Create a timeout that resolves with a value within a certain amount of time */
  static run<T>(timeout: number, handle: (this: Timeout<T>, signal: AbortSignal) => T | Promise<T>): Timeout<T> {
    const instance = this.#create<T>(timeout)

    try {
      const maybePromise = handle.call(instance, instance.signal)

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
    handle: (this: Timeout<void>, signal: AbortSignal) => void | Promise<void>,
    iterations?: undefined | number,
  ): Timeout<void> {
    let wait: undefined | Timeout<void> = undefined

    const instance = this.#create<void>(0, async (signal) => {
      await Timeout.wait(0)

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
          await handle.call(instance, signal)
        } catch (error) {
          instance.abort(ensureError(error))
          break
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

  #status!: Timeout['status']
  #timeout!: number
  #controller: undefined | AbortController
  #resolve!: (value: undefined | T) => void
  #reject!: (reason: unknown) => void
  #handler!: (this: Timeout<T>) => void
  #timer!: number

  get timeout(): number {
    return this.#timeout
  }

  get status(): 'waiting' | 'executing' | 'resolved' | 'rejected' | 'aborted' | 'cancelled' {
    return this.#status
  }

  get signal(): AbortSignal {
    if (this.#controller === undefined) {
      const controller = new AbortController()

      if (
        this.#status !== 'waiting' &&
        (
          this.#status === 'rejected' ||
          this.#status === 'aborted'
        )
      ) {
        controller.abort()
      } else {
        controller.signal.addEventListener('abort', () => {
          if (this.#status === 'waiting' || this.#status === 'executing') {
            this.#status = 'aborted'
          }

          this.#resolve(undefined as T)
        }, { once: true })
      }

      this.#controller = controller
    }

    return this.#controller.signal
  }

  static #create<T = undefined>(
    timeout: number,
    handle?: undefined | ((this: Timeout<T>, signal: AbortSignal) => T | Promise<T>),
    unref: undefined | boolean = Timeout.unref,
  ): Timeout<T> {
    let promiseResolve!: (value: undefined | T) => void
    let promiseReject!: (reason: unknown) => void

    const instance = new Timeout<T>((resolve, reject) => {
      promiseResolve = resolve
      promiseReject = reject
    })

    instance.#status = 'waiting'
    instance.#timeout = timeout
    instance.#controller = undefined

    instance.#resolve = (value: undefined | T): void => {
      clearTimeout(instance.#timer)

      if (instance.#status === 'waiting' || instance.#status === 'executing') {
        instance.#status = 'resolved'
      }

      promiseResolve(value)

      if (
        instance.#controller !== undefined &&
        instance.#controller.signal.aborted === false &&
        instance.#status === 'aborted'
      ) {
        instance.#controller.abort()
      }
    }

    instance.#reject = (reason: unknown): void => {
      clearTimeout(instance.#timer)

      if (instance.#status === 'waiting' || instance.#status === 'executing') {
        instance.#status = 'rejected'
      }

      promiseReject(reason)

      if (
        instance.#controller !== undefined &&
        instance.#controller.signal.aborted === false &&
        (
          instance.#status === 'rejected' ||
          instance.#status === 'aborted'
        )
      ) {
        instance.#controller.abort()
      }
    }

    instance.#handler = handle === undefined
      ? () => {
        if (instance.#status === 'waiting') {
          instance.#status = 'aborted'
        }

        instance.#resolve(undefined as T)
      }
      : () => {
        if (instance.#status !== 'waiting') {
          return instance.#resolve(undefined as T)
        }

        instance.#status = 'executing'

        try {
          const maybePromise = handle.call(instance, instance.signal)

          if (maybePromise instanceof Promise) {
            maybePromise.then(instance.#resolve).catch(instance.#reject)
          } else {
            instance.#resolve(maybePromise)
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            if (instance.#status === 'executing') {
              instance.#status = 'aborted'
            }

            return instance.#resolve(undefined)
          }

          instance.#reject(error)
        }
      }

    instance.#timer = setTimeout(instance.#handler, timeout)

    return unref ? instance.unref() : instance
  }

  [Symbol.dispose](): void {
    this.cancel()
  }

  /**
   * Abort the timeout by emitting 'abort' to its signal and resolving to undefined or rejecting with the given reason
   * @param reason The reason for aborting the timeout
   */
  abort(reason?: Error): void {
    if (reason === undefined) {
      if (this.#status === 'waiting' || this.#status === 'executing') {
        this.#status = 'aborted'
      }
      this.#resolve(undefined as T)
    } else {
      this.#reject(ensureError(reason))
    }
  }

  /** Cancel the timeout by resolving to undefined */
  cancel(): void {
    if (this.#status === 'waiting' || this.#status === 'executing') {
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
