import { Timeout } from './timeout.ts'

/**
 * Throttles an asynchronous function using a token bucket approach.
 * At most `maxPerSecond` calls can occur in any one-second window.
 * If tokens are not available, calls are queued until tokens refill.
 *
 * @param maxPerSecond - Maximum number of calls allowed per second.
 * @param fn - The asynchronous function to throttle.
 * @returns A throttled version of `fn` with the same interface.
 */
// deno-lint-ignore no-explicit-any
export function throttle<T extends (...args: readonly any[]) => Promise<any>>(
  maxPerSecond: number,
  fn: T,
): T {
  if (maxPerSecond <= 0) {
    throw new Error('maxPerSecond must be greater than 0')
  }

  const frequency = 1000 / maxPerSecond
  const defaultTokens = frequency >= 1 ? maxPerSecond : 1
  const resetDelay = frequency >= 1 ? 1000 : Math.ceil(1000 / maxPerSecond)

  let availableTokens = defaultTokens
  let startTime: undefined | number = undefined
  let timeout: undefined | Timeout<undefined | void> = undefined

  const throttled = (async (...args: readonly unknown[]): Promise<unknown> => {
    const now = Date.now()

    if (startTime === undefined) {
      startTime = now
    }

    if (availableTokens > 0) {
      availableTokens--

      return fn(...args)
    }

    if (timeout !== undefined) {
      await timeout
      return throttled(...args)
    }

    const waitTime = Math.max(resetDelay - (now - startTime), 0)

    if (waitTime === 0) {
      availableTokens = defaultTokens
      startTime = now

      return throttled(...args)
    }

    timeout = Timeout.defer(waitTime, () => {
      availableTokens = defaultTokens
      startTime = undefined
      timeout = undefined
    })

    await timeout

    return throttled(...args)
  }) as T

  return throttled
}
