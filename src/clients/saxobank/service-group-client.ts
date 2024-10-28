import {
  array,
  type Guard,
  integer,
  optional,
  props,
  string,
  unknown,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ensureError } from '../../utils/error.ts'
import { type JSONReadonlyRecord, stringifyJSON } from '../../utils/json.ts'
import { Timeout } from '../../utils/timeout.ts'
import { urlJoin } from '../../utils/url.ts'
import { type HTTPClient, HTTPClientError, type HTTPClientOnErrorHandler } from '../http-client.ts'

type SearchParamsRecord = Record<string, undefined | boolean | number | string | ReadonlyArray<number | string>>

export class ServiceGroupClient {
  readonly #client: HTTPClient
  readonly #serviceURL: URL
  readonly #onError: HTTPClientOnErrorHandler

  constructor({
    client,
    serviceURL,
    onError,
  }: {
    readonly client: HTTPClient
    readonly serviceURL: URL
    readonly onError?: undefined | HTTPClientOnErrorHandler
  }) {
    this.#client = client
    this.#serviceURL = serviceURL

    if (onError === undefined) {
      this.#onError = onRateLimitError.bind(undefined, this.#client)
    } else {
      this.#onError = async (error, retries) => {
        try {
          await onError(error, retries)
        } catch (error) {
          await onRateLimitError(this.#client, ensureError(error), retries)
        }
      }
    }
  }

  appendPath(path: string): ServiceGroupClient {
    return new ServiceGroupClient({
      client: this.#client,
      serviceURL: urlJoin(this.#serviceURL, path),
      onError: this.#onError,
    })
  }

  async get<T = unknown>(options: {
    readonly path?: undefined | string
    readonly headers?: undefined | Record<string, string>
    readonly searchParams?: undefined | SearchParamsRecord
    readonly guard?: undefined | Guard<T>
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<T> {
    const url = urlJoin(this.#serviceURL, options.path)

    setSearchParams(url, options.searchParams)

    return await this.#client.getOkJSON(url, {
      headers: options.headers,
      guard: options.guard,
      coerce: sanitize,
      onError: this.#onError,
      signal: options.signal,
      timeout: options.timeout,
    })
  }

  async *getPaginated<T = unknown>(options: {
    readonly limit?: undefined | number
    readonly path?: undefined | string
    readonly headers?: undefined | Record<string, string>
    readonly searchParams?: undefined | SearchParamsRecord
    readonly guard?: undefined | Guard<T>
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): AsyncGenerator<T, void, undefined> {
    if (typeof options.limit === 'number') {
      if (options.limit === 0) {
        return
      }

      if (Number.isSafeInteger(options.limit) === false || options.limit < 0) {
        throw new Error('Limit must be a non-negative integer')
      }
    }

    const url = urlJoin(this.#serviceURL, options.path)
    const searchParams = {
      $top: options.limit === undefined ? '1000' : options.limit < 1000 ? String(options.limit) : '1000',
      $skip: '0',
      ...options.searchParams,
    }

    const headers = options.headers === undefined
      ? {
        'content-type': 'application/json',
      }
      : {
        'content-type': 'application/json',
        ...Object.fromEntries(
          Object.entries(options.headers).map(([key, value]) => {
            return [key.toLowerCase(), value]
          }),
        ),
      }

    setSearchParams(url, searchParams)

    yield* fetchPaginatedData({
      client: this.#client,
      headers,
      url,
      guard: options.guard,
      limit: options.limit,
      onError: this.#onError,
      signal: options.signal,
      timeout: options.timeout,
    })
  }

  async post<T = unknown>(options: {
    readonly path?: undefined | string
    readonly headers?: undefined | Record<string, string>
    readonly searchParams?: undefined | SearchParamsRecord
    readonly body?: JSONReadonlyRecord
    readonly guard?: undefined | Guard<T>
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<T> {
    const url = urlJoin(this.#serviceURL, options.path)

    const headers = options.headers === undefined
      ? {
        'content-type': 'application/json',
      }
      : {
        'content-type': 'application/json',
        ...Object.fromEntries(
          Object.entries(options.headers).map(([key, value]) => {
            return [key.toLowerCase(), value]
          }),
        ),
      }

    setSearchParams(url, options.searchParams)

    return await this.#client.postOkJSON(url, {
      headers,
      body: stringifyJSON(options.body),
      guard: options.guard,
      coerce: sanitize,
      onError: this.#onError,
      signal: options.signal,
      timeout: options.timeout,
    })
  }

  async put<T = unknown>(options: {
    readonly path?: undefined | string
    readonly headers?: undefined | Record<string, string>
    readonly searchParams?: undefined | SearchParamsRecord
    readonly body?: JSONReadonlyRecord
    readonly guard?: undefined | Guard<T>
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<T> {
    const url = urlJoin(this.#serviceURL, options.path)

    setSearchParams(url, options.searchParams)

    const headers = options.headers === undefined
      ? {
        'content-type': 'application/json',
      }
      : {
        'content-type': 'application/json',
        ...Object.fromEntries(
          Object.entries(options.headers).map(([key, value]) => {
            return [key.toLowerCase(), value]
          }),
        ),
      }

    return await this.#client.putOkJSON(url, {
      headers,
      body: stringifyJSON(options.body),
      guard: options.guard,
      coerce: sanitize,
      onError: this.#onError,
      signal: options.signal,
      timeout: options.timeout,
    })
  }

  async delete<T = unknown>(options: {
    readonly path?: undefined | string
    readonly headers?: undefined | Record<string, string>
    readonly searchParams?: undefined | SearchParamsRecord
    readonly guard?: undefined | Guard<T>
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<T> {
    const url = urlJoin(this.#serviceURL, options.path)

    setSearchParams(url, options.searchParams)

    return await this.#client.deleteOkJSON(url, {
      headers: options.headers,
      guard: options.guard,
      coerce: sanitize,
      onError: this.#onError,
      signal: options.signal,
      timeout: options.timeout,
    })
  }
}

function setSearchParams(url: URL, searchParams?: undefined | SearchParamsRecord): void {
  if (searchParams === undefined) {
    return
  }

  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) {
      continue
    }

    const stringifiedValue = String(value)

    if (stringifiedValue === '') {
      continue
    }

    url.searchParams.set(key, String(value))
  }
}

const TimeoutsWeakMap = new WeakMap<
  HTTPClient,
  Map<string, undefined | Promise<void>>
>()

async function onRateLimitError(client: HTTPClient, error: Error, _retries: number): Promise<void> {
  if (error instanceof HTTPClientError && error.statusCode === 429) {
    const rateLimit = getRateLimitExceeded(error.headers)

    if (rateLimit === undefined) {
      throw error
    }

    let timeouts = TimeoutsWeakMap.get(client)

    if (timeouts === undefined) {
      timeouts = new Map()
      TimeoutsWeakMap.set(client, timeouts)
    }

    let timeout = timeouts.get(rateLimit.name)

    if (timeout === undefined) {
      timeout = Timeout.defer(rateLimit.timeout, () => {
        timeouts.delete(rateLimit.name)
      })

      timeouts.set(rateLimit.name, timeout)
    }

    return await timeout
  }

  throw error
}

function getRateLimitExceeded(
  headers: Record<string, string>,
): undefined | { readonly name: string; readonly timeout: number } {
  const rateLimits: Array<{
    name: string
    timeout: undefined | number
    remaining: undefined | number
  }> = []

  for (const [key, value] of Object.entries(headers)) {
    const regexRemaining = /x-ratelimit-(.*?)-remaining/i
    const matchRemaining = key.match(regexRemaining)

    if (matchRemaining !== null) {
      const name = matchRemaining[1]!.toLowerCase()
      const remaining = parseInt(value, 10)

      if (name === 'appday') {
        if (remaining === 0) {
          throw new Error('Rate limit exceeded for appday')
        } else {
          continue
        }
      }

      const entry = rateLimits.find((entry) => entry.name === name)

      if (entry === undefined) {
        rateLimits.push({ name, timeout: undefined, remaining })
      } else {
        entry.remaining = remaining
      }

      continue
    }

    const regexReset = /x-ratelimit-(.*?)-reset/i
    const matchReset = key.match(regexReset)

    if (matchReset !== null) {
      const name = matchReset[1]!.toLowerCase()

      if (name === 'appday') {
        continue
      }

      const reset = parseInt(value, 10)
      const timeout = Math.max(1, reset) * 1000 // sub-second resets are rounded to 0, but we should still wait a bit

      const entry = rateLimits.find((entry) => entry.name === name)

      if (entry === undefined) {
        rateLimits.push({ name, timeout, remaining: undefined })
      } else {
        entry.timeout = timeout
      }
    }
  }

  if (rateLimits.length === 0) {
    return undefined
  }

  if (rateLimits.length > 1) {
    const names = rateLimits.map((entry) => entry.name).join(', ')

    throw new Error(`Multiple rate limits not supported: ${names}`)
  }

  const entry = rateLimits[0]!

  if (entry.remaining === 0) {
    return {
      name: entry.name,
      // Always sleep at least 1000 milliseconds
      timeout: entry.timeout === undefined || entry.timeout < 1000 ? 1000 : entry.timeout,
    }
  }

  return undefined
}

const FetchPaginatedDataGuards = new WeakMap<
  Guard<unknown>,
  Guard<
    undefined | {
      readonly Data: undefined | readonly unknown[]
      readonly __count: undefined | number
      readonly __next: undefined | string
      readonly MaxRows: undefined | number
    }
  >
>()

async function* fetchPaginatedData<T = unknown>({
  client,
  headers,
  url,
  guard = unknown() as Guard<T>,
  limit,
  onError,
  signal,
  timeout,
}: {
  readonly client: HTTPClient
  readonly headers?: undefined | Record<string, string>
  readonly url: string | URL
  readonly guard?: undefined | Guard<T>
  readonly limit?: undefined | number
  readonly onError?: HTTPClientOnErrorHandler
  readonly signal?: undefined | AbortSignal
  readonly timeout?: undefined | number
}): AsyncGenerator<T, void, undefined> {
  if (limit !== undefined && limit <= 0) {
    return
  }

  let bodyGuard = FetchPaginatedDataGuards.get(guard) as
    | undefined
    | Guard<
      undefined | {
        readonly Data: undefined | readonly T[]
        readonly __count: number | undefined
        readonly __next: string | undefined
        readonly MaxRows: number | undefined
      }
    >

  if (bodyGuard === undefined) {
    bodyGuard = optional(props({
      Data: optional(array(guard)),
      __count: optional(integer()),
      __next: optional(string()),
      MaxRows: optional(integer()),
    }))

    FetchPaginatedDataGuards.set(guard, bodyGuard)
  }

  const startTime = Date.now()

  const resourceBody = await client.getOkJSON(url, {
    headers,
    coerce: sanitize,
    guard: bodyGuard,
    onError,
    signal,
    timeout,
  })

  timeout = timeout === undefined ? undefined : Math.max(0, timeout - (Date.now() - startTime))

  if (resourceBody === undefined) {
    return
  }

  const { __next, Data } = resourceBody

  if (Data === undefined) {
    return
  }

  if (__next === undefined) {
    if (limit !== undefined && Data.length > limit) {
      return yield* Data.slice(0, limit)
    }

    return yield* Data
  }

  if (limit !== undefined) {
    if (Data.length === limit) {
      return yield* Data
    } else if (Data.length > limit) {
      return yield* Data
    }

    limit -= Data.length
  }

  yield* Data

  yield* fetchPaginatedData<T>({
    client,
    headers,
    url: __next,
    guard,
    limit,
    timeout,
    onError,
  })
}

/**
 * The Saxo Bank API returns garbage data in some cases.
 * This function sanitizes the data and removes the garbage.
 */
function sanitize(value: unknown): unknown {
  switch (typeof value) {
    case 'object': {
      if (value === null) {
        return undefined
      }

      if (Array.isArray(value)) {
        const arrayValue = value.reduce((accumulation, item) => {
          const sanitizedItem = sanitize(item)

          if (sanitizedItem !== undefined) {
            accumulation.push(sanitizedItem)
          }

          return accumulation
        }, [])

        return arrayValue.length > 0 ? arrayValue : undefined
      }

      const record = value as Record<string, unknown>

      const sanitizedRecord = {} as Record<string, unknown>

      let hasDefinedProperty = false

      const propertyKeys = Object.keys(record).sort()

      for (const propertyKey of propertyKeys) {
        const propertyValue = record[propertyKey]

        const sanitizedValue = sanitize(propertyValue)

        if (sanitizedValue !== undefined) {
          hasDefinedProperty = true
          sanitizedRecord[propertyKey] = sanitizedValue
        }
      }

      return hasDefinedProperty ? sanitizedRecord : undefined
    }

    case 'string': {
      let trimmedValue = value.trim()

      if (
        trimmedValue.length > 1 &&
        trimmedValue.at(-1) === '.' &&
        trimmedValue.at(-2) === ' '
      ) {
        // remove whitespaces preceeding the dot, but keep the dot
        trimmedValue = trimmedValue.replace(/\s*\.$/, '.')
      }

      if (trimmedValue === '') {
        return undefined
      }

      if (trimmedValue === '.') {
        return undefined
      }

      if (trimmedValue === 'Undefined') {
        return undefined
      }

      return trimmedValue
    }

    default: {
      return value
    }
  }
}
