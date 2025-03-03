export class CombinedSignalController implements Disposable {
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

  [Symbol.dispose](): void {
    for (const signal of this.#signals) {
      signal.removeEventListener('abort', this.#listener)
    }
  }

  abort(): void {
    this.#controller.abort()
  }

  dispose(): void {
    return this[Symbol.dispose]()
  }
}
