import type { Guard } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Debug } from '../../../utils/debug.ts'
import { ensureError } from '../../../utils/error.ts'
import type { JSONReadonlyRecord } from '../../../utils/json.ts'
import { Timeout } from '../../../utils/timeout.ts'
import { urlJoin } from '../../../utils/url.ts'
import { type HTTPClient, HTTPClientError, type HTTPClientOnErrorHandler } from '../../http-client.ts'
import {
  ServiceGroupRequestDelete,
  ServiceGroupRequestGet,
  ServiceGroupRequestGetPaginated,
  ServiceGroupRequestPost,
  ServiceGroupRequestPut,
} from '../service-group-client/service-group-request.ts'
import { type SearchParamRecord, ServiceGroupSearchParams } from './service-group-search-params.ts'

const debug = {
  error: Debug('service-group-client:http-client-error'),
  rateLimit: Debug('service-group-client:rate-limit'),
}

export class ServiceGroupClient {
  readonly #client: HTTPClient
  readonly #serviceURL: URL
  readonly #onError: HTTPClientOnErrorHandler
  readonly #searchParamsMaxLength: number

  get http(): HTTPClient {
    return this.#client
  }

  constructor({ client, onError, searchParamsMaxLength, serviceURL }: {
    readonly client: HTTPClient
    readonly onError?: undefined | HTTPClientOnErrorHandler
    readonly searchParamsMaxLength: number
    readonly serviceURL: URL
  }) {
    this.#client = client
    this.#searchParamsMaxLength = searchParamsMaxLength
    this.#serviceURL = serviceURL

    if (onError === undefined) {
      this.#onError = onHTTPClientError.bind(undefined, this.#client)
    } else {
      this.#onError = async (error, retries) => {
        try {
          await onError(error, retries)
        } catch (error) {
          await onHTTPClientError(this.#client, ensureError(error), retries)
        }
      }
    }
  }

  appendPath(path: string, searchParamsMaxLength?: undefined | number): ServiceGroupClient {
    return new ServiceGroupClient({
      client: this.#client,
      serviceURL: this.createURL(path),
      onError: this.#onError,
      searchParamsMaxLength: searchParamsMaxLength ?? this.#searchParamsMaxLength,
    })
  }

  createURL(path?: undefined | string): URL {
    return urlJoin(this.#serviceURL, path)
  }

  get<T = unknown>(options: {
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): ServiceGroupRequestGet<T> {
    return new ServiceGroupRequestGet({
      client: this.#client,
      guard: options.guard,
      headers: options.headers,
      onError: this.#onError,
      searchParams: new ServiceGroupSearchParams({
        values: options.searchParams,
        maxLength: this.#searchParamsMaxLength,
      }),
      timeout: options.timeout,
      url: this.createURL(options.path),
    })
  }

  getPaginated<T = unknown>(options: {
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly limit?: undefined | number
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): ServiceGroupRequestGetPaginated<T> {
    if (typeof options.limit === 'number') {
      if (Number.isSafeInteger(options.limit) === false) {
        throw new Error(`Limit must be a safe integer`)
      }

      if (options.limit < 0) {
        throw new Error('Limit must be a non-negative integer')
      }
    }

    return new ServiceGroupRequestGetPaginated({
      client: this.#client,
      guard: options.guard,
      headers: options.headers,
      limit: options.limit,
      onError: this.#onError,
      searchParams: new ServiceGroupSearchParams({
        values: {
          $top: options.limit === undefined ? 1000 : Math.min(options.limit, 1000),
          $skip: 0,
          ...options.searchParams,
        },
        maxLength: this.#searchParamsMaxLength,
      }),
      signal: options.signal,
      timeout: options.timeout,
      url: this.createURL(options.path),
    })
  }

  post<T = void>(options: {
    readonly body?: JSONReadonlyRecord
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): ServiceGroupRequestPost<T> {
    return new ServiceGroupRequestPost({
      body: options.body,
      client: this.#client,
      guard: options.guard,
      headers: options.headers,
      onError: this.#onError,
      searchParams: new ServiceGroupSearchParams({
        values: options.searchParams,
        maxLength: this.#searchParamsMaxLength,
      }),
      signal: options.signal,
      timeout: options.timeout,
      url: this.createURL(options.path),
    })
  }

  put<T = void>(options: {
    readonly body?: JSONReadonlyRecord
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): ServiceGroupRequestPut<T> {
    return new ServiceGroupRequestPut({
      body: options.body,
      client: this.#client,
      guard: options.guard,
      headers: options.headers,
      onError: this.#onError,
      searchParams: new ServiceGroupSearchParams({
        values: options.searchParams,
        maxLength: this.#searchParamsMaxLength,
      }),
      signal: options.signal,
      timeout: options.timeout,
      url: this.createURL(options.path),
    })
  }

  delete<T = void>(options: {
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): ServiceGroupRequestDelete<T> {
    return new ServiceGroupRequestDelete({
      client: this.#client,
      guard: options.guard,
      headers: options.headers,
      onError: this.#onError,
      searchParams: new ServiceGroupSearchParams({
        values: options.searchParams,
        maxLength: this.#searchParamsMaxLength,
      }),
      signal: options.signal,
      timeout: options.timeout,
      url: this.createURL(options.path),
    })
  }
}

const TimeoutsWeakMap = new WeakMap<
  HTTPClient,
  Map<string, undefined | Promise<void>>
>()

async function onHTTPClientError(client: HTTPClient, error: Error, _retries: number): Promise<void> {
  if (error instanceof HTTPClientError === false) {
    throw error
  }

  switch (error.statusCode) {
    case 429: {
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

      debug.rateLimit(rateLimit.name, `- waiting ${rateLimit.timeout}ms`)

      return await timeout
    }
  }

  debug.error(error.message)

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
