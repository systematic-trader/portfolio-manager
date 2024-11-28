import { CallbackTarget } from '../utils/callback-target.ts'
import { ensureError } from '../utils/error.ts'
import { PromiseQueue } from '../utils/promise-queue.ts'
import { mergeAbortSignals } from '../utils/signal.ts'
import { Timeout } from '../utils/timeout.ts'
import { WebSocketClientInactivityMonitor } from './websocket-client-inactivity-monitor.ts'

/**
 * WebSocketClient error.
 */
export class WebSocketClientError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

/**
 * Error class for WebSocketClient error associated with an event.
 */
export class WebSocketClientEventError extends Error {
  /**
   * The URL of the WebSocket connection that was aborted.
   */
  readonly url: string

  /**
   * The event that triggered the error.
   */
  readonly event: Event

  /**
   * Creates a new instance.
   *
   * @param event - The event that caused the error.
   */
  constructor({ event, url }: { readonly event: Event; readonly url: WebSocketClientEventError['url'] }) {
    super(`Error event of type "${event.type}" occurred.`)
    this.name = this.constructor.name
    this.url = url
    this.event = event
  }
}

/**
 * Error class for WebSocket connection abortion.
 */
export class WebSocketClientAbortError extends WebSocketClientError {
  /**
   * The URL of the WebSocket connection that was aborted.
   */
  readonly url: string
  /**
   * Creates a new instance.
   *
   * @param url - The URL of the WebSocket.
   */
  constructor({ url }: { readonly url: WebSocketClientAbortError['url'] }) {
    super('WebSocket connecting aborted')
    this.url = url
  }
}

type CallbackTargetMap = {
  open: [event: Event]
  close: [event: CloseEvent]
  error: [event: Event]
  message: [event: MessageEvent]
}

/**
 * WebSocketClient provides a high-level API to manage WebSocket connections,
 * including reconnection logic, event handling, and inactivity timeout support.
 */
export class WebSocketClient extends CallbackTarget<CallbackTargetMap> implements AsyncDisposable {
  readonly #queue: PromiseQueue
  readonly #eventQueue: PromiseQueue
  readonly #inactivity = new WebSocketClientInactivityMonitor()

  #websocket: undefined | WebSocket = undefined
  #error: undefined | Error = undefined
  #state: WebSocketClient['state']
  #url: URL
  #binaryType: 'arraybuffer' | 'blob'
  #openedAt = -1
  #closedAt = -1
  #errorAt = -1
  #messageAt = -1

  /**
   * The inactivity monitor instance associated with the WebSocket.
   */
  get inactivity(): WebSocketClientInactivityMonitor {
    return this.#inactivity
  }

  /**
   * Tracks the WebSocket connection state and error, if any.
   */
  get state(): {
    readonly status: 'open' | 'closed'
    readonly error: undefined
  } | {
    readonly status: 'failed'
    readonly error: Error
  } {
    return this.#state
  }

  /**
   * The URL associated with the WebSocket.
   */
  get url(): string {
    return this.#url.href
  }

  /**
   * The type of binary data transmitted over the WebSocket.
   */
  get binaryType(): 'blob' | 'arraybuffer' {
    return this.#binaryType
  }

  /**
   * The number of bytes of data buffered but not yet transmitted.
   */
  get bufferedAmount(): number {
    return this.#websocket?.bufferedAmount ?? 0
  }

  /**
   * The protocol selected by the WebSocket server.
   */
  get protocol(): string {
    return this.#websocket?.protocol ?? ''
  }

  /**
   * The extensions negotiated during the WebSocket handshake.
   */
  get extensions(): string {
    return this.#websocket?.extensions ?? ''
  }

  /**
   * The timestamp when the WebSocket was opened. Returns -1 if not opened.
   */
  get openedAt(): number {
    return this.#openedAt
  }

  /**
   * The timestamp when the WebSocket was closed. Returns -1 if not closed.
   */
  get closedAt(): number {
    return this.#closedAt
  }

  /**
   * The timestamp when an error occurred. Returns -1 if no error occurred.
   */
  get errorAt(): number {
    return this.#errorAt
  }

  /**
   * The timestamp when the last message was received. Returns -1 if no message received.
   */
  get messageAt(): number {
    return this.#messageAt
  }

  /**
   * Constructs a new WebSocketClient instance.
   *
   * @param url - The URL to which the WebSocket connects.
   * @param binaryType - The type of binary data ("blob" or "arraybuffer").
   */
  constructor({
    url,
    binaryType = 'blob',
  }: {
    readonly url: string | URL
    readonly binaryType?: undefined | WebSocketClient['binaryType']
  }) {
    const queue = new PromiseQueue(async (error) => {
      await this.#close({ error })
    })

    const eventQueue = new PromiseQueue(queue.addError)

    super(eventQueue)

    this.#queue = queue
    this.#eventQueue = eventQueue
    this.#url = typeof url === 'string' ? new URL(url) : url
    this.#binaryType = binaryType

    // deno-lint-ignore no-this-alias
    const self = this

    this.#state = {
      get status() {
        if (self.#error !== undefined) {
          return 'failed'
        }

        const readyState = self.#websocket?.readyState

        switch (readyState) {
          case undefined:
          case WebSocket.CONNECTING:
          case WebSocket.CLOSED: {
            return 'closed'
          }

          case WebSocket.OPEN:
          case WebSocket.CLOSING: {
            return 'open'
          }

          default: {
            break
          }
        }

        throw new WebSocketClientError(`Unknown WebSocket readyState: ${readyState}`)
      },

      get error() {
        return self.#error
      },
    } as WebSocketClient['state']
  }

  async #connect(
    options: undefined | {
      readonly url?: undefined | string | URL
      readonly binaryType?: undefined | WebSocketClient['binaryType']
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
    } = {},
  ): Promise<undefined | Error> {
    // Check if the WebSocket is in a failed state. If so, return the existing error.
    if (this.#state.status === 'failed') {
      return this.#state.error
    }

    // Ensure the WebSocket is in a closed state before attempting to connect.
    if (this.#state.status !== 'closed') {
      return new WebSocketClientError(
        'Must be "closed" before connecting. Check the "state.status" property before calling "connect"',
      )
    }

    // Create a timeout if a timeout duration is provided. This will trigger an abort if the connecting takes too long.
    using timeout = options.timeout === undefined ? undefined : Timeout.wait(options.timeout)

    // Merge the AbortSignal from the options and the timeout signal to handle both cancellation and timeouts.
    const signal = mergeAbortSignals(
      options.signal,
      timeout?.signal,
    )

    // Resolve the URL to connect to, defaulting to the previously stored URL if none is provided.
    const url = options.url === undefined ? this.#url : new URL(options.url)

    // Check if the signal is already aborted before proceeding.
    if (signal?.aborted) {
      return new WebSocketClientAbortError({ url: url.href })
    }

    // Update the internal URL and binary type with the resolved values.
    this.#url = url
    this.#binaryType = options.binaryType ?? this.#binaryType

    // Create a new WebSocket instance with the target URL.
    const websocket = new WebSocket(this.#url.href)

    // Set the binary type for the WebSocket.
    websocket.binaryType = this.#binaryType

    // Define a listener to handle signal abort events by closing the WebSocket if it is not already closed.
    const signalAbortListener = () => {
      if (websocket.readyState !== WebSocket.CLOSED) {
        websocket.close()
      }
    }

    // Attach the abort listener to the signal to ensure it reacts to abort events.
    signal?.addEventListener('abort', signalAbortListener, { once: true })

    // Create a promise with resolvers to manage the connection flow asynchronously.
    const { promise, reject, resolve } = Promise.withResolvers<void>()

    // Placeholder to store connection errors, if any occur during the process.
    let connectingError: undefined | Error = undefined

    // Listener to handle errors that occur during the connection process.
    const errorListener = (event: Event) => {
      // Determine if the error is an ErrorEvent or a generic event and extract the error.
      if (
        event instanceof ErrorEvent ||
        (
          typeof event === 'object' &&
          event !== null &&
          'error' in event &&
          event.error !== undefined &&
          event.error !== null
        )
      ) {
        connectingError = ensureError(event.error)
      } else {
        connectingError = new WebSocketClientEventError({ event, url: this.#url.href })
      }

      // Cancel the timeout, clean up the signal listener, and close the WebSocket.
      timeout?.cancel()
      signal?.removeEventListener('abort', signalAbortListener)
      websocket.removeEventListener('open', openListener)
      websocket.close()
    }

    // Listener to handle the WebSocket `open` event.
    const openListener = (event: Event) => {
      // Cleanup after successfully opening the connection.
      timeout?.cancel()
      signal?.removeEventListener('abort', signalAbortListener)
      websocket.removeEventListener('close', closeListener)
      websocket.removeEventListener('error', errorListener)

      // Update the timestamp for when the WebSocket was opened.
      this.#openedAt = Date.now()

      // Add listeners for `message`, `error`, and `close` events on the WebSocket
      websocket.addEventListener('message', (event) => {
        this.#messageAt = Date.now()
        this.emit('message', event)
      })

      websocket.addEventListener('error', (event) => {
        this.#errorAt = Date.now()
        this.emit('error', event)
      })

      websocket.addEventListener('close', (event) => {
        this.#closedAt = Date.now()
        this.#websocket = undefined
        this.emit('close', event)
      }, { once: true })

      // Activate the inactivity monitor for this WebSocket.
      WebSocketClientInactivityMonitor.open(this.#inactivity, websocket)

      this.emit('open', event)

      // Resolve the promise to indicate successful connection.
      resolve()
    }

    // Listener to handle the WebSocket `close` event during the connection phase.
    const closeListener = (_event: CloseEvent) => {
      timeout?.cancel()
      signal?.removeEventListener('abort', signalAbortListener)
      websocket.removeEventListener('open', openListener)
      websocket.removeEventListener('error', errorListener)

      // If there was an error, reject the promise; otherwise, resolve it.
      if (connectingError === undefined) {
        resolve()
      } else {
        reject(connectingError)
      }
    }

    // Attach the listeners to the WebSocket
    websocket.addEventListener('error', errorListener, { once: true })
    websocket.addEventListener('open', openListener, { once: true })
    websocket.addEventListener('close', closeListener, { once: true })

    try {
      // Wait for the WebSocket to either open or fail during the connection process.
      await promise

      // Ensure the WebSocket is in the `open` state; otherwise, something went wrong.
      if (websocket.readyState !== WebSocket.OPEN) {
        throw new Error(`Something went wrong internally! The WebSocket.readyState is "${websocket.readyState}"`)
      }

      this.#websocket = websocket
    } catch (error) {
      // Return the encountered error.
      return ensureError(error)
    }

    // Return to indicate successful connection.
    return
  }

  async #close(
    options: undefined | {
      readonly error?: undefined | Error
      readonly code?: undefined | number
      readonly reason?: undefined | string
    } = {},
  ): Promise<undefined | Error> {
    // If there isn't already an error set, associate the provided error (if any).
    if (options.error !== undefined) {
      const { error } = options

      this.#error = error

      this.emit('error', new ErrorEvent('error', { error, message: error.message }))
    }

    // If there is no active WebSocket instance, there's nothing to close. Exit early.
    if (this.#websocket === undefined) {
      return
    }

    // If the WebSocket is already in the CLOSED state, clean up the reference and exit.
    if (this.#websocket.readyState === WebSocket.CLOSED) {
      this.#websocket = undefined
      return
    }

    try {
      // Attempt to close the WebSocket with the provided code and reason.
      // Invalid arguments can cause exceptions, so we handle them with a try-catch.
      // Refer to: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close#exceptions
      this.#websocket.close(options.code, options.reason)
    } catch (error) {
      // If an exception occurs while closing, wrap it as an `Error` and return it.
      return ensureError(error)
    }

    // Create a promise that resolves when the WebSocket emits a `close` event.
    const { promise, resolve } = Promise.withResolvers<CloseEvent>()

    // Attach a one-time event listener for the `close` event to resolve the promise.
    this.#websocket.addEventListener('close', resolve, { once: true })

    // Wait for the `close` event to ensure the WebSocket has fully transitioned to the CLOSED state.
    await promise

    // Once the WebSocket is closed, clean up the reference.
    this.#websocket = undefined

    // Return `undefined` to indicate the WebSocket was successfully closed.
    return undefined
  }

  /**
   * Cleans up resources and closes the WebSocket connection.
   */
  [Symbol.asyncDispose](): Promise<void> {
    return this.close()
  }

  /**
   * Establishes a WebSocket connection.
   * Ensure the WebSocketClient is in the "closed" state before calling this method,
   * otherwise use the `reconnect` method to reconnect an existing WebSocket.
   *
   * @param options - Connection options.
   *   - `url`: The URL to which the WebSocket connects.
   *   - `binaryType`: The type of binary data transmitted over the WebSocket.
   *   - `signal`: An AbortSignal to cancel the connection attempt.
   *   - `timeout`: A timeout for the connection attempt, in milliseconds.
   */
  async connect(
    options: undefined | {
      readonly url?: undefined | string | URL
      readonly binaryType?: undefined | WebSocketClient['binaryType']
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
    } = {},
  ): Promise<void> {
    // Validate the timeout option if provided.
    // A timeout less than or equal to 0 is considered invalid.
    if (options.timeout !== undefined && options.timeout <= 0) {
      throw new Error('Timeout must be greater than 0')
    }

    // Variable to capture any connection errors that occur during the process.
    let connectError: undefined | Error = undefined

    // Use the PromiseQueue to enqueue the connection logic, ensuring sequential execution.
    this.#queue.call(
      async () => {
        // Attempt to establish the connection.
        connectError = await this.#connect(options)
      },
      {
        // Handle any rejection of the connection logic.
        onError: (error) => {
          // Capture the error for later processing.
          connectError = error

          // Re-throw the error to ensure it propagates to the PromiseQueue.
          throw error
        },
      },
    )

    // Wait for the queue to finish processing all tasks, including the connection attempt.
    await this.#queue.drain()

    // After the queue has drained, check if a connection error occurred.
    if (connectError !== undefined) {
      // Throw the captured connection error, if any, to notify the caller.
      throw connectError
    }
  }

  /**
   * Closes the WebSocket connection.
   *
   * @param options - Close options.
   *   - `error`: The error that caused the WebSocket to close.
   *   - `code`: The WebSocket close code.
   *   - `reason`: The reason for closing the connection.
   */
  async close(
    options: undefined | {
      readonly error?: undefined | Error
      readonly code?: undefined | number
      readonly reason?: undefined | string
    } = {},
  ): Promise<void> {
    // Variable to capture any errors that occur during the close operation.
    let closeError: undefined | Error = undefined

    // Enqueue the close operation to ensure sequential execution in the PromiseQueue.
    this.#queue.call(
      async () => {
        // Attempt to close the WebSocket connection.
        // If invalid arguments are passed (e.g., invalid close code or reason), the #close method will throw an error.
        // These errors are caught and returned as `closeError`.
        closeError = await this.#close(options)
      },
      {
        // Handle any rejection during the close operation.
        onError: (error) => {
          // Capture the error for later processing.
          closeError = error

          // Rethrow the error to propagate it through the PromiseQueue.
          throw error
        },
      },
    )

    // Wait for the PromiseQueue to finish processing the close operation.
    await this.#queue.drain()

    // After the queue has drained, await any events occurred during the close operation.
    await this.#eventQueue.drain()

    // After the queue has drained, check if any error occurred during the close operation.
    if (closeError !== undefined) {
      // If an error was captured, throw it to notify the caller.
      throw closeError
    }
  }

  /**
   * Reconnects the WebSocket.
   *
   * @param options - Reconnection options.
   *   - `connect`: Options for establishing the new connection.
   *   - `close`: Options for closing the current connection.
   */
  async reconnect(
    options: undefined | {
      readonly connect?: undefined | {
        readonly url?: undefined | string | URL
        readonly binaryType?: undefined | WebSocketClient['binaryType']
        readonly signal?: undefined | AbortSignal
        readonly timeout?: undefined | number
      }
      readonly close?: undefined | {
        readonly error?: undefined | Error
        readonly code?: undefined | number
        readonly reason?: undefined | string
      }
    } = {},
  ): Promise<void> {
    // Validate the `timeout` parameter for the connection options.
    // A timeout of 0 or less is not allowed as it would be invalid.
    if (options.connect?.timeout !== undefined && options.connect.timeout <= 0) {
      throw new Error('Timeout must be greater than 0')
    }

    // Variable to capture any errors that occur during the reconnection process.
    let reconnectError: undefined | Error = undefined

    // Add the reconnection logic to the PromiseQueue to ensure sequential execution.
    this.#queue.call(
      async () => {
        // If there is an existing error, capture it and stop further execution.
        if (this.#error !== undefined) {
          reconnectError = this.#error
          return
        }

        // Attempt to close the current WebSocket connection.
        // This ensures the WebSocket is in a clean state before reconnecting.
        reconnectError = await this.#close(options.close)

        // If an error occurred during the close operation, stop further execution.
        if (reconnectError !== undefined) {
          return
        }

        // Ensure the WebSocket is fully closed before proceeding with the reconnection.
        if (this.#state.status !== 'closed') {
          throw new WebSocketClientError(
            'Must be "closed" before reconnecting. Something internally went wrong when closing before reconnecting',
          )
        }

        // Attempt to establish a new WebSocket connection with the provided options.
        reconnectError = await this.#connect(options.connect)
      },
      {
        // Handle any errors that occur during the reconnection process.
        onError: (error) => {
          // Capture the error for later processing.
          reconnectError = error

          // Rethrow the error to propagate it through the PromiseQueue.
          throw error
        },
      },
    )

    // Wait for the PromiseQueue to finish processing the reconnection logic.
    await this.#queue.drain()

    // After the queue has drained, check if any error occurred during the reconnection process.
    if (reconnectError !== undefined) {
      // If an error was captured, throw it to notify the caller.
      throw reconnectError
    }
  }

  /**
   * Sends data over the WebSocket connection.
   *
   * @param data - The data to send.
   * @returns The WebSocketClient instance for method chaining.
   * @throws {WebSocketClientError} If the WebSocket is not open.
   */
  send(...args: Parameters<WebSocket['send']>): this {
    if (this.#state.status !== 'open') {
      throw new WebSocketClientError(
        'Must be "open". Check the "state.status" property before calling "send"',
      )
    }

    this.#websocket!.send(...args)

    return this
  }
}
