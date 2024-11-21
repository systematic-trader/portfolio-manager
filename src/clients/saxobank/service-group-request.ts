import {
  array,
  type Guard,
  integer,
  optional,
  props,
  string,
  unknown,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { type JSONReadonlyRecord, stringifyJSON } from '../../utils/json.ts'
import { urlJoin } from '../../utils/url.ts'
import { type HTTPClient, type HTTPClientOnErrorHandler, HTTPClientRequestAbortError } from '../http-client.ts'
import { type SearchParamsRecord, ServiceGroupRequestSearchParams } from './service-group-request-search-params.ts'

abstract class ServiceGroupRequest<T> {
  readonly #client: HTTPClient
  readonly #url: URL
  readonly #headers: undefined | Record<string, string>
  readonly #guard: undefined | Guard<T>
  readonly #timeout: undefined | number
  readonly #onError: undefined | HTTPClientOnErrorHandler
  readonly #signal: undefined | AbortSignal

  readonly searchParams: ServiceGroupRequestSearchParams

  constructor({
    client,
    url,
    headers,
    guard,
    timeout,
    onError,
    searchParams,
    signal,
  }: {
    readonly client: HTTPClient
    readonly url: URL
    readonly headers: undefined | Record<string, string>
    readonly guard: undefined | Guard<T>
    readonly timeout: undefined | number
    readonly onError?: undefined | HTTPClientOnErrorHandler
    readonly searchParams: undefined | SearchParamsRecord
    readonly signal?: undefined | AbortSignal
  }) {
    this.#client = client
    this.#url = url
    this.#headers = headers
    this.#guard = guard
    this.#timeout = timeout
    this.#onError = onError
    this.searchParams = new ServiceGroupRequestSearchParams(searchParams)
    this.#signal = signal
  }

  #createFullURL(): string {
    const clone = urlJoin(this.#url)
    clone.search = this.searchParams.toString()
    return clone.toString()
  }

  #createJsonHeaders(): Record<string, string> {
    return this.#headers === undefined
      ? {
        'content-type': 'application/json',
      }
      : {
        'content-type': 'application/json',
        ...Object.fromEntries(
          Object.entries(this.#headers).map(([key, value]) => {
            return [key.toLowerCase(), value]
          }),
        ),
      }
  }

  protected async get(): Promise<T> {
    return await this.#client.getOkJSON(this.#createFullURL(), {
      headers: this.#headers,
      guard: this.#guard,
      coerce: sanitize,
      onError: this.#onError,
      timeout: this.#timeout,
      signal: this.#signal,
    })
  }

  protected async *getPaginated({
    limit,
  }: {
    readonly limit?: undefined | number
  }): AsyncGenerator<T, void, undefined> {
    if (typeof limit === 'number') {
      if (limit === 0) {
        return
      }

      if (Number.isSafeInteger(limit) === false || limit < 0) {
        throw new Error('Limit must be a non-negative integer')
      }
    }

    this.searchParams.set('$top', limit === undefined ? '1000' : limit < 1000 ? String(limit) : '1000')
    this.searchParams.set('$skip', '0')

    const headers = this.#createJsonHeaders()

    try {
      yield* fetchPaginatedData({
        client: this.#client,
        headers,
        url: this.#createFullURL(),
        guard: this.#guard,
        limit,
        onError: this.#onError,
        timeout: this.#timeout,
        signal: this.#signal,
      })
    } catch (error) {
      if (error instanceof HTTPClientRequestAbortError) {
        return
      }

      throw error
    }
  }

  protected async post({
    body,
  }: {
    readonly body?: undefined | JSONReadonlyRecord
  }): Promise<T> {
    const headers = this.#createJsonHeaders()

    if (this.#guard === undefined) {
      await this.#client.post(this.#createFullURL(), {
        headers,
        body: stringifyJSON(body),
        onError: this.#onError,
        timeout: this.#timeout,
        signal: this.#signal,
      })

      return undefined as T
    }

    return await this.#client.postOkJSON(this.#createFullURL(), {
      headers,
      body: stringifyJSON(body),
      guard: this.#guard,
      coerce: sanitize,
      onError: this.#onError,
      timeout: this.#timeout,
      signal: this.#signal,
    })
  }

  protected async put(body: JSONReadonlyRecord): Promise<T> {
    const headers = this.#createJsonHeaders()

    if (this.#guard === undefined) {
      await this.#client.put(this.#createFullURL(), {
        headers,
        body: stringifyJSON(body),
        onError: this.#onError,
        timeout: this.#timeout,
        signal: this.#signal,
      })

      return undefined as T
    }

    return await this.#client.putOkJSON(this.#createFullURL(), {
      headers,
      body: stringifyJSON(body),
      guard: this.#guard,
      coerce: sanitize,
      onError: this.#onError,
      timeout: this.#timeout,
      signal: this.#signal,
    })
  }

  protected async delete(): Promise<T> {
    if (this.#guard === undefined) {
      await this.#client.delete(this.#createFullURL(), {
        headers: this.#headers,
        onError: this.#onError,
        timeout: this.#timeout,
        signal: this.#signal,
      })

      return undefined as T
    }

    return await this.#client.deleteOkJSON(this.#createFullURL(), {
      headers: this.#headers,
      guard: this.#guard,
      coerce: sanitize,
      onError: this.#onError,
      timeout: this.#timeout,
      signal: this.#signal,
    })
  }
}

export class ServiceGroupRequestGet<T = unknown> extends ServiceGroupRequest<T> {
  async execute(): Promise<T> {
    return await this.get()
  }
}

export class ServiceGroupRequestGetPaginated<T = unknown> extends ServiceGroupRequest<T> {
  readonly #limit: undefined | number

  constructor({
    client,
    url,
    headers,
    guard,
    timeout,
    onError,
    searchParams,
    signal,
    limit,
  }: {
    readonly client: HTTPClient
    readonly url: URL
    readonly headers: undefined | Record<string, string>
    readonly guard: undefined | Guard<T>
    readonly timeout: undefined | number
    readonly onError?: undefined | HTTPClientOnErrorHandler
    readonly searchParams: undefined | SearchParamsRecord
    readonly signal?: undefined | AbortSignal
    readonly limit: undefined | number
  }) {
    super({ client, url, headers, guard, timeout, onError, searchParams, signal })
    this.#limit = limit
  }

  async *execute(): AsyncGenerator<T, void, undefined> {
    yield* this.getPaginated({
      limit: this.#limit,
    })
  }
}

export class ServiceGroupRequestPut<T = void> extends ServiceGroupRequest<T> {
  readonly #body: undefined | JSONReadonlyRecord // todo this is not too clean

  constructor({
    client,
    url,
    headers,
    guard,
    timeout,
    onError,
    searchParams,
    signal,
    body,
  }: {
    readonly client: HTTPClient
    readonly url: URL
    readonly headers: undefined | Record<string, string>
    readonly guard: undefined | Guard<T>
    readonly timeout: undefined | number
    readonly onError?: undefined | HTTPClientOnErrorHandler
    readonly searchParams: undefined | SearchParamsRecord
    readonly signal?: undefined | AbortSignal
    readonly body?: undefined | JSONReadonlyRecord
  }) {
    super({ client, url, headers, guard, timeout, onError, searchParams, signal })
    this.#body = body
  }

  async execute(): Promise<T> {
    return await this.put({
      body: this.#body,
    })
  }
}

export class ServiceGroupRequestPost<T = void> extends ServiceGroupRequest<T> {
  readonly #body: undefined | JSONReadonlyRecord

  constructor({
    client,
    url,
    headers,
    guard,
    timeout,
    onError,
    searchParams,
    signal,
    body,
  }: {
    readonly client: HTTPClient
    readonly url: URL
    readonly headers: undefined | Record<string, string>
    readonly guard: undefined | Guard<T>
    readonly timeout: undefined | number
    readonly onError?: undefined | HTTPClientOnErrorHandler
    readonly searchParams: undefined | SearchParamsRecord
    readonly signal?: undefined | AbortSignal
    readonly body?: undefined | JSONReadonlyRecord
  }) {
    super({ client, url, headers, guard, timeout, onError, searchParams, signal })
    this.#body = body
  }

  async execute(): Promise<T> {
    return await this.post({
      body: this.#body,
    })
  }
}

export class ServiceGroupRequestDelete<T = void> extends ServiceGroupRequest<T> {
  async execute(): Promise<T> {
    return await this.delete()
  }
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
