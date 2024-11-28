import { PromiseQueue } from './promise-queue.ts'

function CallbackTargetErrorHandle(error: Error): void {
  throw error
}

const EmitImmediately = { immediately: true } as const

interface AnyCallback<This> {
  // deno-lint-ignore no-explicit-any
  (this: This, ...args: ReadonlyArray<any>): void | Promise<void>
}

export interface CallbackTargetQueueFunction {
  (callback: () => void | Promise<void>): void | Promise<void>
}

/**
 * An asynchronous event emitter with typed events.
 *
 * The `CallbackTarget` class allows you to register event listeners for specific event types, where each event type has a defined set of argument types.
 * Listeners can be registered to be invoked continuously or only once. Event emission is asynchronous and listeners are invoked in the order they were registered.
 */
export class CallbackTarget<T extends Record<string, ReadonlyArray<unknown>>> {
  // WeakSet to keep track of persistent callbacks that shouldn't be removed when calling removeAllListeners.
  readonly #persistentMap: Map<keyof T, WeakSet<AnyCallback<this>>>
  // Map of event types to their continuous callbacks.
  readonly #continuousMap: Map<keyof T, Set<AnyCallback<this>>>
  // Map of event types to their once callbacks.
  readonly #onceMap: Map<keyof T, Set<AnyCallback<this>>>
  // Main PromiseQueue to manage the execution order and error handling of callbacks.
  readonly #queue: PromiseQueue
  // Options for the queue execution, such as whether to execute immediately.
  readonly #queueOptions: { readonly immediately?: undefined | boolean }
  // WeakMap to store custom queue functions for callbacks, allowing per-callback execution control.
  readonly #callbackQueueMap: Map<keyof T, WeakMap<AnyCallback<this>, CallbackTargetQueueFunction>>

  /**
   * Creates a new `CallbackTarget` instance.
   *
   * @param queue - The main PromiseQueue used to manage callback execution order and error handling.
   * @param options - Optional settings for queue execution, such as immediate execution.
   */
  constructor(
    queue?: undefined | PromiseQueue,
    options: undefined | { readonly immediately?: undefined | boolean } = EmitImmediately,
  ) {
    // Initialize the Map for persistent callbacks.
    this.#persistentMap = new Map()
    // Initialize maps to store continuous callbacks per event type.
    this.#continuousMap = new Map()
    // Initialize maps to store once callbacks per event type.
    this.#onceMap = new Map()
    // Assign the provided PromiseQueue for managing execution.
    this.#queue = queue ?? new PromiseQueue(CallbackTargetErrorHandle)
    // Store the queue options.
    this.#queueOptions = options
    // Initialize the WeakMap for custom callback queue functions.
    this.#callbackQueueMap = new Map()

    // Bind methods to maintain the correct `this` context when they are called externally.
    this.emit = this.emit.bind(this)
    this.addListener = this.addListener.bind(this)
    this.removeListener = this.removeListener.bind(this)
    this.removeAllListeners = this.removeAllListeners.bind(this)
  }

  /**
   * Drains the main PromiseQueue, ensuring all pending callbacks are executed.
   *
   * @returns A promise that resolves when the queue is drained.
   */
  protected drain(): Promise<void> {
    return this.#queue.drain()
  }

  /**
   * Emits an event of the specified type, invoking all registered listeners asynchronously with the provided arguments.
   *
   * @param type - The event type to emit.
   * @param args - The arguments to pass to the event listeners.
   */
  protected emit<Type extends keyof T>(
    type: Type,
    ...args: T[Type]
  ): void {
    const continuousTypeSet = this.#continuousMap.get(type)

    if (continuousTypeSet !== undefined) {
      const callbackQueueMap = this.#callbackQueueMap.get(type)

      // Iterate over continuous callbacks for this event type.
      for (const callback of continuousTypeSet) {
        // Get the custom queue function for this callback, if any.
        const callBackQueue = callbackQueueMap?.get(callback)

        if (callBackQueue === undefined) {
          // If no custom queue, use the main queue to execute the callback.
          this.#queue.call(callback.bind(this, ...args), this.#queueOptions)
        } else {
          try {
            // If a custom queue function is provided, use it to execute the callback.
            callBackQueue(callback.bind(this, ...args))
          } catch (error) {
            this.#queue.addError(error)
          }
        }
      }
    }

    const onceTypeSet = this.#onceMap.get(type)

    if (onceTypeSet !== undefined) {
      // Iterate over 'once' callbacks for this event type.
      for (const callback of onceTypeSet) {
        // Execute 'once' callbacks immediately using the main queue.
        this.#queue.call(callback.bind(this, ...args), EmitImmediately)
      }

      // Clear 'once' callbacks after execution.
      onceTypeSet.clear()
      this.#onceMap.delete(type)
    }
  }

  /**
   * Adds a listener for the specified event type.
   *
   * @param type - The event type to listen for.
   * @param callback - The callback function to invoke when the event is emitted.
   * @param options - Additional options for the listener.
   *   - `once`: If true, the listener is invoked only once and then removed.
   *   - `persistent`: If true, the listener cannot be removed when calling `removeAllListeners`.
   *   - `queue`: A custom queue function to manage the execution of the callback.
   *
   * @returns Returns the instance to allow method chaining.
   */
  addListener<Type extends keyof T>(
    type: Type,
    callback: (this: this, ...args: T[Type]) => void | Promise<void>,
    options?: undefined | {
      readonly once?: undefined | boolean
      readonly persistent?: undefined | boolean
      readonly queue?: undefined | CallbackTargetQueueFunction
    },
  ): this {
    let onceTypeSet = this.#onceMap.get(type)
    let continuousTypeSet = this.#continuousMap.get(type)

    if (options?.once === true) {
      // If the listener should be invoked only once.
      if (onceTypeSet === undefined) {
        // Create a new Set for 'once' listeners if it doesn't exist.
        onceTypeSet = new Set()
        this.#onceMap.set(type, onceTypeSet)
      }

      // Add the callback to the 'once' Set.
      onceTypeSet.add(callback)
      // Remove it from continuous listeners if present.
      continuousTypeSet?.delete(callback)
    } else {
      // For continuous listeners.
      if (continuousTypeSet === undefined) {
        // Create a new Set for continuous listeners if it doesn't exist.
        continuousTypeSet = new Set()
        this.#continuousMap.set(type, continuousTypeSet)
      }

      // Add the callback to the continuous Set.
      continuousTypeSet.add(callback)
      // Remove it from 'once' listeners if present.
      onceTypeSet?.delete(callback)
    }

    let persistentSet = this.#persistentMap.get(type)

    if (options?.persistent === true) {
      if (persistentSet === undefined) {
        // Create a new WeakSet for persistent callbacks if it doesn't exist.
        persistentSet = new WeakSet()
        this.#persistentMap.set(type, persistentSet)
      }

      // Mark the callback as persistent so it won't be removed by `removeAllListeners`.
      persistentSet.add(callback)
    } else {
      // Ensure the callback isn't marked as persistent if the option isn't set.
      persistentSet?.delete(callback)
    }

    if (options?.queue === undefined) {
      // If no custom queue function is provided, remove any existing one.
      this.#callbackQueueMap.get(type)?.delete(callback)
    } else {
      let callbackQueueMap = this.#callbackQueueMap.get(type)

      if (callbackQueueMap === undefined) {
        // Create a new WeakMap for custom queue functions if it doesn't exist.
        callbackQueueMap = new WeakMap()
        this.#callbackQueueMap.set(type, callbackQueueMap)
      }

      // Associate the custom queue function with the callback.
      callbackQueueMap.set(callback, options.queue)
    }

    return this
  }

  /**
   * Checks if a listener is registered for the specified event type.
   *
   * @param type - The event type to check for the listener.
   * @param callback - The callback function to check for.
   *
   * @returns Returns true if the listener is registered for the event type; otherwise, false.
   */
  hasListener<Type extends keyof T>(
    type: Type,
    callback: (this: this, ...args: T[Type]) => void | Promise<void>,
  ): boolean {
    // Check if the callback exists in either the continuous or 'once' Sets for the event type.
    return (
      this.#continuousMap.get(type)?.has(callback) ||
      this.#onceMap.get(type)?.has(callback)
    ) ?? false
  }

  /**
   * Removes a listener for the specified event type.
   *
   * @param type - The event type to remove the listener from.
   * @param callback - The callback function to remove.
   *
   * @returns Returns the instance to allow method chaining.
   */
  removeListener<Type extends keyof T>(
    type: Type,
    callback: (this: this, ...args: T[Type]) => void | Promise<void>,
  ): this {
    // If the callback was found and removed, also remove its persistent mark.
    this.#persistentMap.get(type)?.delete(callback)

    const continuousTypeSet = this.#continuousMap.get(type)

    if (continuousTypeSet !== undefined) {
      // Remove the callback from continuous listeners.
      if (continuousTypeSet.delete(callback)) {
        if (continuousTypeSet.size === 0) {
          // Remove the event type from the map if no listeners remain.
          this.#continuousMap.delete(type)
        }
      }
    }

    const onceTypeSet = this.#onceMap.get(type)

    if (
      onceTypeSet !== undefined &&
      onceTypeSet.delete(callback) &&
      onceTypeSet.size === 0
    ) {
      // Remove the event type from the map if no listeners remain.
      this.#onceMap.delete(type)
    }

    // Remove any custom queue function associated with the callback.
    this.#callbackQueueMap.get(type)?.delete(callback)

    if (this.#continuousMap.has(type) === false && this.#onceMap.has(type) === false) {
      // If no listeners remain for the event type, remove the persistent mark.
      this.#persistentMap.delete(type)
      this.#callbackQueueMap.delete(type)
    }

    return this
  }

  /**
   * Removes all listeners for an event type or all event types.
   *
   * @param type - The event type to remove all listeners from. If omitted, all listeners for all event types are removed.
   *
   * @returns Returns the instance to allow method chaining.
   */
  removeAllListeners(type?: undefined | keyof T): this {
    if (type === undefined) {
      // Remove all listeners for all event types.
      for (const [type, continuousTypeSet] of this.#continuousMap) {
        const persistentSet = this.#persistentMap.get(type)
        const callbackQueueMap = this.#callbackQueueMap.get(type)

        for (const callback of continuousTypeSet) {
          // Remove callbacks that are not marked as persistent.
          if (persistentSet === undefined || persistentSet.has(callback) === false) {
            continuousTypeSet.delete(callback)
            // Remove any custom queue function associated with the callback.
            callbackQueueMap?.delete(callback)
          }
        }

        if (continuousTypeSet.size === 0) {
          // Remove the event type from the map if no listeners remain.
          this.#continuousMap.delete(type)
        }
      }

      for (const [type, onceTypeSet] of this.#onceMap) {
        const persistentSet = this.#persistentMap.get(type)
        const callbackQueueMap = this.#callbackQueueMap.get(type)

        for (const callback of onceTypeSet) {
          // Remove callbacks that are not marked as persistent.
          if (persistentSet === undefined || persistentSet.has(callback) === false) {
            onceTypeSet.delete(callback)
            // Remove any custom queue function associated with the callback.
            callbackQueueMap?.delete(callback)
          }
        }

        if (onceTypeSet.size === 0) {
          // Remove the event type from the map if no listeners remain.
          this.#onceMap.delete(type)
        }
      }
    } else {
      // Remove all listeners for the specified event type.
      const continuousTypeSet = this.#continuousMap.get(type)
      const persistentSet = this.#persistentMap.get(type)
      const callbackQueueMap = this.#callbackQueueMap.get(type)

      if (continuousTypeSet !== undefined) {
        for (const callback of continuousTypeSet) {
          if (persistentSet === undefined || persistentSet.has(callback) === false) {
            continuousTypeSet.delete(callback)
            // Remove any custom queue function associated with the callback.
            callbackQueueMap?.delete(callback)
          }
        }

        if (continuousTypeSet.size === 0) {
          this.#continuousMap.delete(type)
        }
      }

      const onceTypeSet = this.#onceMap.get(type)

      if (onceTypeSet !== undefined) {
        for (const callback of onceTypeSet) {
          if (persistentSet === undefined || persistentSet.has(callback) === false) {
            onceTypeSet.delete(callback)
            // Remove any custom queue function associated with the callback.
            callbackQueueMap?.delete(callback)
          }
        }

        if (onceTypeSet.size === 0) {
          this.#onceMap.delete(type)
        }
      }
    }

    return this
  }
}
