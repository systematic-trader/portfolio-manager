export class CombinedAbortSignal implements AbortSignal, Disposable {
  readonly #controller = new AbortController()
  readonly #signals: ReadonlyArray<AbortSignal>
  readonly #listener = () => {
    if (this.#controller.signal.aborted === false) {
      this.#controller.abort()
    }

    for (const signal of this.#signals) {
      signal.removeEventListener('abort', this.#listener)
    }
  }

  get signal(): AbortSignal {
    return this.#controller.signal
  }

  constructor(...signals: ReadonlyArray<undefined | AbortSignal>) {
    this.#signals = signals.filter((signal): signal is AbortSignal => signal !== undefined)

    if (this.#signals.length === 0) {
      return
    }

    let aborted = false

    for (const signal of this.#signals) {
      if (signal.aborted) {
        aborted = true
      }
    }

    if (aborted) {
      this.#controller.abort()

      return
    }

    const listener = () => {
      if (this.#controller.signal.aborted === false) {
        this.#controller.abort()
      }

      for (const signal of this.#signals) {
        signal.removeEventListener('abort', listener)
      }
    }

    for (const signal of this.#signals) {
      signal.addEventListener('abort', listener, { once: true })
    }
  }

  any(signals: Iterable<AbortSignal>): AbortSignal {
    return this.#controller.signal.any(signals)
  }

  dispatchEvent(event: Event): boolean {
    return this.#controller.signal.dispatchEvent(event)
  }

  get aborted(): boolean {
    return this.#controller.signal.aborted
  }

  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/abort_event) */
  onabort: ((this: AbortSignal, ev: Event) => unknown) | null = null
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/reason) */
  readonly reason: unknown = undefined
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AbortSignal/throwIfAborted) */
  throwIfAborted(): void {
    return this.#controller.signal.throwIfAborted()
  }

  addEventListener<K extends keyof AbortSignalEventMap>(
    type: K,
    listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    this.#controller.signal.addEventListener(type, listener, options)
  }

  removeEventListener<K extends keyof AbortSignalEventMap>(
    type: K,
    listener: (this: AbortSignal, ev: AbortSignalEventMap[K]) => undefined,
    options?: boolean | EventListenerOptions,
  ): void
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void {
    this.#controller.signal.removeEventListener(type, listener, options)
  }

  [Symbol.dispose](): void {
    for (const signal of this.#signals) {
      signal.removeEventListener('abort', this.#listener)
    }
  }

  dispose(): void {
    return this[Symbol.dispose]()
  }
}
