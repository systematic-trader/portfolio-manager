import { PromiseQueue } from './promise-queue.ts'

const QueueOptions = { immediately: true } as const

function CallbackTargetErrorHandle(error: Error): void {
  throw error
}

/**
 * An asynchronous event emitter with typed events.
 *
 * The `CallbackTarget` class allows you to register event listeners for specific event types, where each event type has a defined set of argument types.
 * Listeners can be registered to be invoked continuously or only once. Event emission is asynchronous and listeners are invoked in the order they were registered.
 *
 * @implements {AsyncDisposable}
 */
export class CallbackTarget<T extends Record<string, ReadonlyArray<unknown>>> implements AsyncDisposable {
  // deno-lint-ignore no-explicit-any
  readonly #continuous: Map<keyof T, Set<(this: this, ...args: ReadonlyArray<any>) => void | Promise<void>>>
  // deno-lint-ignore no-explicit-any
  readonly #once: Map<keyof T, Set<(this: this, ...args: ReadonlyArray<any>) => void | Promise<void>>>
  readonly #queue: PromiseQueue

  /**
   * Creates a new `CallbackTarget` instance.
   *
   * @param onError - An optional error handler function that is called if a listener throws an error. By default, errors are rethrown.
   */
  constructor(onError: undefined | ((error: Error) => void | Promise<void>) = CallbackTargetErrorHandle) {
    this.#continuous = new Map()
    this.#once = new Map()
    this.#queue = new PromiseQueue(onError)

    this.emit = this.emit.bind(this)
    this.addListener = this.addListener.bind(this)
    this.removeListener = this.removeListener.bind(this)
    this.removeAllListeners = this.removeAllListeners.bind(this)
  }

  /**
   * Emits an event of the specified type, invoking all registered listeners asynchronously with the provided arguments.
   *
   * @param type - The event type to emit.
   * @param args - The arguments to pass to the event listeners.
   *
   * @returns Returns the instance to allow method chaining.
   */
  protected emit<Type extends keyof T>(type: Type, ...args: T[Type]): this {
    const continuousTypeSet = this.#continuous.get(type)

    if (continuousTypeSet !== undefined) {
      for (const callback of continuousTypeSet) {
        this.#queue.call(callback.bind(this, ...args), QueueOptions)
      }
    }

    const onceTypeSet = this.#once.get(type)

    if (onceTypeSet !== undefined) {
      for (const callback of onceTypeSet) {
        this.#queue.call(callback.bind(this, ...args), QueueOptions)
      }

      onceTypeSet.clear()
    }

    return this
  }

  /**
   * Disposes of the `CallbackTarget` asynchronously, ensuring that all queued events are processed before disposal.
   *
   * @returns - A promise that resolves when all queued events have been processed.
   */
  [Symbol.asyncDispose](): Promise<void> {
    return this.#queue.drain()
  }

  /**
   * Adds a listener for the specified event type.
   *
   * @param type - The event type to listen for.
   * @param callback - The callback function to invoke when the event is emitted.
   * @param options.once - If true, the listener is invoked only once and then removed.
   *
   * @returns Returns the instance to allow method chaining.
   */
  addListener<Type extends keyof T>(
    type: Type,
    callback: (this: this, ...args: T[Type]) => void | Promise<void>,
    options?: undefined | { readonly once?: undefined | boolean },
  ): this {
    if (options?.once) {
      let onceTypeSet = this.#once.get(type)

      if (onceTypeSet === undefined) {
        onceTypeSet = new Set()
        this.#once.set(type, onceTypeSet)
      }

      onceTypeSet.add(callback)
    } else {
      let continuousTypeSet = this.#continuous.get(type)

      if (continuousTypeSet === undefined) {
        continuousTypeSet = new Set()
        this.#continuous.set(type, continuousTypeSet)
      }

      continuousTypeSet.add(callback)
    }

    return this
  }

  /**
   * Checks if a listener is registered for the specified event type.
   * @param type - The event type to check for the listener.
   * @param callback - The callback function to check for.
   *
   * @returns Returns true if the listener is registered for the event type; otherwise, false.
   */
  hasListener<Type extends keyof T>(
    type: Type,
    callback: (this: this, ...args: T[Type]) => void | Promise<void>,
  ): boolean {
    return (this.#continuous.get(type)?.has(callback) || this.#once.get(type)?.has(callback)) ?? false
  }

  /**
   * Removes a listener for the specified event type.
   *
   * @template Type - The event type to remove the listener from.
   * @param type - The event type to remove the listener from.
   * @param callback - The callback function to remove. If omitted, all listeners for the event type are removed.
   *
   * @returns Returns the instance to allow method chaining.
   */
  removeListener<Type extends keyof T>(
    type: Type,
    callback?: undefined | ((this: this, ...args: T[Type]) => void | Promise<void>),
  ): this {
    const continuousTypeSet = this.#continuous.get(type)

    if (continuousTypeSet !== undefined) {
      if (callback === undefined) {
        this.#continuous.delete(type)
      } else {
        continuousTypeSet.delete(callback)

        if (continuousTypeSet.size === 0) {
          this.#continuous.delete(type)
        }
      }
    }

    const onceTypeSet = this.#once.get(type)

    if (onceTypeSet !== undefined) {
      if (callback === undefined) {
        this.#once.delete(type)
      } else {
        onceTypeSet.delete(callback)

        if (onceTypeSet.size === 0) {
          this.#once.delete(type)
        }
      }
    }

    return this
  }

  /**
   * Removes all listeners for all event types.
   *
   * @returnsReturns the instance to allow method chaining.
   */
  removeAllListeners(): this {
    this.#continuous.clear()
    this.#once.clear()

    return this
  }
}
