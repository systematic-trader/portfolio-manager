import { Timeout } from '../utils/timeout.ts'

export interface WebSocketClientInactivityCallback {
  (): void | Promise<void>
}

/**
 * Tracks inactivity on a WebSocket and triggers registered callbacks after specified timeouts.
 *
 * This class monitors WebSocket activity (e.g., receiving messages) and resets inactivity timers accordingly.
 * Callbacks can be registered to execute after specific time intervals of inactivity.
 */
export class WebSocketClientInactivityMonitor {
  /**
   * Opens the monitor for a given WebSocket. The monitor begins tracking activity and inactivity on the WebSocket.
   *
   * @param monitor - The `InactivityMonitor` instance to open.
   * @param websocket - The WebSocket to monitor. Must be in the open state.
   * @throws {Error} If the WebSocket is not open or the monitor is already bound to a WebSocket.
   */
  static open(monitor: WebSocketClientInactivityMonitor, websocket: WebSocket): void {
    // Ensure the WebSocket is in the "open" state before monitoring.
    if (websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket must be open')
    }

    // Prevent reopening the monitor if it is already tracking a WebSocket.
    if (monitor.#websocket !== undefined) {
      throw new Error('InactivityMonitor already open')
    }

    // Bind the WebSocket to the monitor.
    monitor.#websocket = websocket

    // Listen for activity on the WebSocket (e.g., messages).
    websocket.addEventListener('message', monitor.#message)

    // Automatically clean up when the WebSocket is closed.
    websocket.addEventListener('close', monitor.#close, { once: true })

    // Trigger the initial touch to set up timers based on existing listeners.
    monitor.#message()
  }

  /**
   * A map of registered inactivity callbacks and their corresponding timeout durations in milliseconds.
   * The keys are callback functions, and the values are timeout durations.
   */
  readonly #listeners = new Map<WebSocketClientInactivityCallback, number>()

  /**
   * A map of active timeout IDs for each registered callback.
   * The keys are callback functions, and the values are the IDs of their respective timeout.
   */
  readonly #timeouts = new Map<WebSocketClientInactivityCallback, number>()

  /**
   * The currently monitored WebSocket instance, or `undefined` if no WebSocket is being monitored.
   */
  #websocket: undefined | WebSocket = undefined

  /**
   * The timestamp of the last activity detected on the WebSocket.
   * A value of `-1` indicates that no activity has occurred yet.
   */
  #messageAt = -1

  /**
   * Handles cleanup when the WebSocket is closed.
   *
   * Removes all registered listeners, clears active timeouts, and resets internal state.
   * This method is automatically triggered when the WebSocket emits a `close` event.
   */
  #close = (): void => {
    // Remove the activity listener from the WebSocket.
    this.#websocket!.removeEventListener('message', this.#message)

    // Clear all active timers associated with inactivity callbacks.
    for (const timeout of this.#timeouts.values()) {
      clearTimeout(timeout)
    }

    // Reset internal state.
    this.#timeouts.clear()
    this.#websocket = undefined
    this.#messageAt = -1
  }

  /**
   * Resets inactivity timers and updates the last activity timestamp.
   *
   * Called whenever activity is detected on the WebSocket (e.g., receiving a message).
   * All existing timeouts are cleared and recreated based on the current listeners.
   */
  #message = (): void => {
    // Update the last activity timestamp to the current time.
    this.#messageAt = Date.now()

    // Clear all existing timers to avoid firing outdated callbacks.
    for (const timeout of this.#timeouts.values()) {
      clearTimeout(timeout)
    }
    this.#timeouts.clear()

    // Set new timers for all registered callbacks.
    for (const [callback, timeout] of this.#listeners) {
      const timer = setTimeout(callback, timeout)

      // Ensure the timer doesn't block the event loop, if Timeout has the unref property set to true.
      if (Timeout.unref) {
        Deno.unrefTimer(timer)
      }

      // Track the new timer for this callback.
      this.#timeouts.set(callback, timer)
    }
  }

  /**
   * Registers a callback to be invoked after the specified timeout of inactivity.
   *
   * If activity occurs before the timeout elapses, the timer is reset.
   * @param callback - The function to invoke after the timeout.
   * @param timeout - The duration in milliseconds to wait for inactivity before invoking the callback.
   */

  add(callback: WebSocketClientInactivityCallback, timeout: number): this {
    // Check if the callback is already registered and has an active timer.
    const existingTimer = this.#timeouts.get(callback)

    if (existingTimer !== undefined) {
      // Clear the existing timer to prevent it from firing.
      clearTimeout(existingTimer)
    }

    // Add the callback and its timeout duration to the listener map.
    this.#listeners.set(callback, timeout)

    // If the monitor is not yet active (e.g., no WebSocket or no activity), return early.
    if (this.#messageAt === -1) {
      return this
    }

    // Calculate the remaining time until the callback should be invoked.
    const remaining = Math.max(0, timeout - (Date.now() - this.#messageAt))

    // Set a timer for the remaining duration.
    const timer = setTimeout(callback, remaining)

    // Ensure the timer doesn't block the event loop, if Timeout has the unref property set to true.
    if (Timeout.unref) {
      Deno.unrefTimer(timer)
    }

    return this
  }

  /**
   * Checks if a callback is registered with the monitor.
   * @param callback - The function to check.
   * @returns `true` if the callback is registered, `false` otherwise.
   */
  has(callback: WebSocketClientInactivityCallback): boolean {
    return this.#listeners.has(callback)
  }

  /**
   * Removes a previously registered inactivity callback.
   *
   * If the callback is associated with an active timer, the timer is cleared.
   * @param callback - The function to remove.
   */
  remove(callback: WebSocketClientInactivityCallback): this {
    // Remove the callback from the listener map.
    this.#listeners.delete(callback)

    // Check if there's an active timer for this callback and clear it if necessary.
    const timer = this.#timeouts.get(callback)

    if (timer !== undefined) {
      clearTimeout(timer)
      this.#timeouts.delete(callback)
    }

    return this
  }

  /**
   * Removes all registered inactivity callbacks.
   *
   * Clears all active timers and resets the listener map.
   */
  removeAll(): this {
    // Clear the listener map.
    this.#listeners.clear()

    // Clear all active timers to prevent firing of stale callbacks.
    for (const timer of this.#timeouts.values()) {
      clearTimeout(timer)
    }

    this.#timeouts.clear()

    return this
  }
}
