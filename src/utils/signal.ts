export function mergeAbortSignals(...signals: ReadonlyArray<undefined | AbortSignal>): undefined | AbortSignal {
  const definedSignals = signals.filter((signal): signal is AbortSignal => signal !== undefined)

  if (definedSignals.length === 0) {
    return undefined
  }

  let aborted = false

  for (const signal of definedSignals) {
    if (signal.aborted) {
      aborted = true
    }
  }

  const controller = new AbortController()

  if (aborted) {
    controller.abort()

    return controller.signal
  }

  const listener = () => {
    if (controller.signal.aborted === false) {
      controller.abort()
    }

    for (const signal of definedSignals) {
      signal.removeEventListener('abort', listener)
    }
  }

  for (const signal of definedSignals) {
    signal.addEventListener('abort', listener, { once: true })
  }

  return controller.signal
}
