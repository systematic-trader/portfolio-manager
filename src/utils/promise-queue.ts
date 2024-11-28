import { ensureError } from './error.ts'

const PROMISE_VOID = Promise.resolve()
const PROMISE_THEN_CALLBACK = () => PROMISE_VOID

/**
 * A function type that defines how errors in the `PromiseQueue` are handled.
 *
 * This handler is invoked whenever a task in the `PromiseQueue` fails, allowing custom logic
 * to process or respond to errors. The handler can be synchronous or asynchronous.
 *
 * @param error - The error that occurred during the execution of a task in the queue.
 *                The error is always provided as an `Error` object.
 * @returns An optional promise if the handler performs asynchronous operations. The `PromiseQueue`
 *          will wait for the returned promise to settle before continuing with subsequent tasks.
 *
 * @example
 * // Example of a synchronous error handler:
 * const errorHandler: PromiseQueueErrorHandler = (error) => {
 *   console.error('Error occurred:', error.message)
 * }
 *
 * @example
 * // Example of an asynchronous error handler:
 * const errorHandler: PromiseQueueErrorHandler = async (error) => {
 *   await logErrorToDatabase(error)
 *   notifyAdmin(error)
 * }
 */
export interface PromiseQueueErrorHandler {
  (error: Error): void | Promise<void>
}

/**
 * A class that manages a queue of promises, ensuring sequential handling of their resolutions
 * or rejections, with configurable error handling.
 *
 * The `PromiseQueue` processes tasks (promises or callbacks) sequentially, ensuring that their
 * results are handled in the order they are added to the queue. Note that already-created promises
 * begin execution immediately, but their results (resolution or rejection) are handled sequentially
 * by the queue.
 *
 * Errors are managed through an `onError` callback provided during construction, which is invoked
 * whenever an error occurs.
 *
 * The queue supports advanced error-handling mechanisms and customizable execution timing, such as
 * processing tasks immediately or appending them to the end of the queue.
 */
export class PromiseQueue {
  /**
   * An optional callback that gets invoked whenever a rejection is encountered.
   */
  readonly #onError: PromiseQueueErrorHandler

  /**
   * Tracks the number of promises currently in the queue.
   *
   * This value is incremented when a new promise or callback is added to the queue and decremented
   * once the promise or callback has been finalized.
   */
  #count = 0

  /**
   * Increments the internal `count` to reflect that a new promise or callback has been added to the queue.
   */
  #countUp = (): void => {
    this.#count++
  }

  /**
   * Decrements the internal `count` to reflect that a promise or callback has been finalized.
   */
  #countDown = (): void => {
    this.#count--
  }

  /**
   * Indicates whether the queue is currently idle.
   *
   * The queue is considered idle when there are no pending promises or callbacks being processed.
   *
   * @returns `true` if the queue is empty.
   *
   * @example
   * const queue = new PromiseQueue((error) => console.error(error))
   * queue.add(Promise.resolve())
   * queue.call(async () => await Promise.resolve())
   * console.log(queue.empty) // false
   * await queue.drain()
   * console.log(queue.empty) // true
   */
  get empty(): boolean {
    return this.#count === 0
  }

  /**
   * The internal promise queue, ensuring sequential execution.
   */
  #queue: Promise<void> = PROMISE_VOID

  /**
   * Constructs a new `PromiseQueue` instance.
   *
   * @param onError - A callback that is invoked whenever an error occurs during
   *                     task handling. This callback is required and must handle all errors
   *                     encountered during the queue's execution.
   */
  constructor(onError: PromiseQueueErrorHandler) {
    this.#onError = onError

    this.add = this.add.bind(this)
    this.addError = this.addError.bind(this)
    this.call = this.call.bind(this)
    this.drain = this.drain.bind(this)
  }

  /**
   * Adds a batch of already-created promises to the queue for sequential handling of their results.
   *
   * Note that the provided promises begin execution as soon as they are created. However, their
   * results (resolution or rejection) are handled sequentially by the queue in the order they are added.
   * Any rejection is processed using the `addError` method, which invokes the required `onError` callback.
   *
   * @param promises - A readonly array of promises whose results will be handled in order.
   * @returns The current instance for method chaining.
   */
  add(...promises: ReadonlyArray<Promise<unknown>>): this {
    if (promises.length === 0) {
      return this
    }

    for (const promise of promises) {
      this.#countUp()

      // Ensure that the possible promise rejection is caught.
      // It is important to create the promise chain in a separate statement to avoid
      // possibly postpone the error handling to the next promise in the queue.
      // The onError-callback must be called directly after the promise is rejected,
      // and not when the queue is processing the next promise.
      const promiseWithCatch = promise
        .then(PROMISE_THEN_CALLBACK /* chain empty promise to "free" the return of the callback */)
        .catch(this.addError)
        .finally(this.#countDown)

      this.#queue = this.#queue.then(() => promiseWithCatch)
    }

    return this
  }

  /**
   * Handles an error by invoking the required `onError` callback.
   *
   * The `onError` callback, provided during construction, is called with the error.
   * If the callback itself throws an error, that error will propagate.
   *
   * @param error - The error to be handled.
   * @returns A promise that resolves once the error has been processed.
   */
  async addError(error: unknown): Promise<void> {
    if (error === undefined || error === null) {
      return
    }

    const ensuredError = ensureError(error)

    try {
      const maybePromise = this.#onError(ensuredError)

      if ((maybePromise as unknown) instanceof Promise) {
        await maybePromise
      }
    } catch (callbackError) {
      throw callbackError
    }
  }

  /**
   * Adds a callback function to the queue for execution, with configurable execution timing
   * and error-handling behavior.
   *
   * The callback can be executed immediately or at the end of the current queue based on the
   * `immediately` parameter. Errors during the callback's execution are handled by the instance-level
   * `onError` error handler provided during construction or overridden by the `onError` option
   * specified for this callback.
   *
   * @param callback - A function that returns a value or a promise. The callback is executed as part of the queue.
   * @param options - An optional object containing:
   *   - `immediately`: A boolean indicating when the callback should execute.
   *                    - `true`: Executes the callback immediately in parallel with the current
   *                      queue and chains back into the queue.
   *                    - `false` or `undefined`: Adds the callback to the end of the queue.
   *   - `onError`: An optional error-handling callback that overrides the instance-level
   *                   `onError` handler for this callback.
   *                   - If provided, this callback is invoked when an error occurs during the
   *                     execution of this callback.
   *                   - Errors occurring within the onError-callback may still propagate to the
   *                     instance-level `onError` handler if rethrown.
   * @returns The current instance for method chaining.
   */
  call(
    callback: () => unknown,
    {
      immediately,
      onError,
    }: {
      readonly immediately?: undefined | boolean
      readonly onError?: undefined | PromiseQueueErrorHandler
    } = {},
  ): this {
    this.#countUp()

    if (immediately === true) {
      let result: undefined | Promise<unknown> = undefined

      try {
        result = Promise.resolve(callback())
      } catch (error) {
        result = Promise.reject(error)
      }

      this.#queue = Promise.all([
        this.#queue,
        result
          .catch(
            onError === undefined ? this.addError : async (error: unknown) => {
              try {
                await onError(ensureError(error))
              } catch (callbackError) {
                this.addError(ensureError(callbackError))
              }
            },
          )
          .finally(this.#countDown),
      ]).then(PROMISE_THEN_CALLBACK /* chain empty promise to "free" the return of the callback */)
    } else {
      this.#queue = this.#queue
        .then(callback)
        .then(PROMISE_THEN_CALLBACK /* chain empty promise to "free" the return of the callback */)
        .catch(
          onError === undefined ? this.addError : async (error: unknown) => {
            try {
              await onError(ensureError(error))
            } catch (callbackError) {
              this.addError(ensureError(callbackError))
            }
          },
        )
        .finally(this.#countDown)
    }

    return this
  }

  /**
   * Waits for the current queue to finish handling all tasks.
   *
   * This method ensures that all promises added to the queue have been resolved or rejected
   * and their results handled before it completes. Errors are handled by the global `onError`
   * callback provided during construction.
   *
   * @returns A promise that resolves when the queue is fully drained.
   */
  async drain(): Promise<void> {
    if (this.#count === 0) {
      return
    }

    // Wait for the entire queue to settle.
    await this.#queue
  }
}
