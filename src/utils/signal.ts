export function mergeAbortSignals(...signals: ReadonlyArray<undefined | AbortSignal>): undefined | AbortSignal {
  if (signals.length === 0) {
    return undefined
  }

  let merge = false

  for (const signal of signals) {
    if (signal === undefined) {
      continue
    }

    if (signal.aborted) {
      return signal
    }

    merge = true
  }

  if (merge === false) {
    return undefined
  }

  const controller = new AbortController()

  for (const signal of signals) {
    if (signal === undefined || signal.aborted) {
      continue
    }

    const listener = () => {
      if (controller.signal.aborted === false) {
        controller.abort()
      }
    }

    signal.addEventListener('abort', listener, { once: true })
  }

  return controller.signal
}
