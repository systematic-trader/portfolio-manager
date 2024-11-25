import {
  array,
  type Guard,
  integer,
  optional,
  props,
  string,
  unknown,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

import { type JSONReadonlyRecord, stringifyJSON } from '../../../utils/json.ts'
import { urlJoin } from '../../../utils/url.ts'
import { type HTTPClient, type HTTPClientOnErrorHandler, HTTPClientRequestAbortError } from '../../http-client.ts'
import { sanitizeSaxobankValue } from './sanitize-saxobank-value.ts'
import type { ServiceGroupSearchParams } from './service-group-search-params.ts'

abstract class ServiceGroupRequest<T> {
  readonly #client: HTTPClient
  readonly #guard: undefined | Guard<T>
  readonly #headers: undefined | Record<string, string>
  readonly #onError: undefined | HTTPClientOnErrorHandler
  readonly #signal: undefined | AbortSignal
  readonly #timeout: undefined | number
  readonly #url: URL
  readonly searchParams: ServiceGroupSearchParams

  constructor({ client, guard, headers, onError, searchParams, signal, timeout, url }: {
    readonly client: HTTPClient
    readonly url: URL
    readonly headers: undefined | Record<string, string>
    readonly guard: undefined | Guard<T>
    readonly timeout: undefined | number
    readonly onError?: undefined | HTTPClientOnErrorHandler
    readonly searchParams: ServiceGroupSearchParams
    readonly signal?: undefined | AbortSignal
  }) {
    this.#client = client
    this.#guard = guard
    this.#headers = headers
    this.#onError = onError
    this.#signal = signal
    this.#timeout = timeout
    this.#url = url
    this.searchParams = searchParams
  }

  #createFullURL(): string {
    const clone = urlJoin(this.#url)
    clone.search = this.searchParams.toString()
    return clone.toString()
  }

  #createJSONHeaders(): Record<string, string> {
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
      coerce: sanitizeSaxobankValue,
      guard: this.#guard,
      headers: this.#headers,
      onError: this.#onError,
      signal: this.#signal,
      timeout: this.#timeout,
    })
  }

  protected async *getPaginated({ limit }: {
    readonly limit?: undefined | number
  }): AsyncGenerator<T, void, undefined> {
    if (limit === 0) {
      return // we should never return anything if the limit is 0
    }

    const url = this.#createFullURL()
    const headers = this.#createJSONHeaders()

    try {
      yield* fetchPaginatedData({
        client: this.#client,
        guard: this.#guard,
        headers,
        limit,
        onError: this.#onError,
        signal: this.#signal,
        timeout: this.#timeout,
        url,
      })
    } catch (error) {
      if (error instanceof HTTPClientRequestAbortError) {
        return
      }

      throw error
    }
  }

  protected async post({ body }: {
    readonly body?: undefined | JSONReadonlyRecord
  }): Promise<T> {
    const url = this.#createFullURL()
    const headers = this.#createJSONHeaders()

    if (this.#guard === undefined) {
      await this.#client.post(url, {
        body: stringifyJSON(body),
        headers,
        onError: this.#onError,
        signal: this.#signal,
        timeout: this.#timeout,
      })

      return undefined as T
    }

    return await this.#client.postOkJSON(url, {
      body: stringifyJSON(body),
      coerce: sanitizeSaxobankValue,
      guard: this.#guard,
      headers,
      onError: this.#onError,
      signal: this.#signal,
      timeout: this.#timeout,
    })
  }

  protected async put({ body }: {
    readonly body?: undefined | JSONReadonlyRecord
  }): Promise<T> {
    const url = this.#createFullURL()
    const headers = this.#createJSONHeaders()

    if (this.#guard === undefined) {
      await this.#client.put(url, {
        body: stringifyJSON(body),
        headers,
        onError: this.#onError,
        signal: this.#signal,
        timeout: this.#timeout,
      })

      return undefined as T
    }

    return await this.#client.putOkJSON(url, {
      body: stringifyJSON(body),
      coerce: sanitizeSaxobankValue,
      guard: this.#guard,
      headers,
      onError: this.#onError,
      signal: this.#signal,
      timeout: this.#timeout,
    })
  }

  protected async delete(): Promise<T> {
    const url = this.#createFullURL()

    if (this.#guard === undefined) {
      await this.#client.delete(url, {
        headers: this.#headers,
        onError: this.#onError,
        signal: this.#signal,
        timeout: this.#timeout,
      })

      return undefined as T
    }

    return await this.#client.deleteOkJSON(url, {
      coerce: sanitizeSaxobankValue,
      guard: this.#guard,
      headers: this.#headers,
      onError: this.#onError,
      signal: this.#signal,
      timeout: this.#timeout,
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

  constructor({ client, guard, headers, limit, onError, searchParams, signal, timeout, url }: {
    readonly client: HTTPClient
    readonly guard: undefined | Guard<T>
    readonly headers: undefined | Record<string, string>
    readonly limit: undefined | number
    readonly onError?: undefined | HTTPClientOnErrorHandler
    readonly searchParams: ServiceGroupSearchParams
    readonly signal?: undefined | AbortSignal
    readonly timeout: undefined | number
    readonly url: URL
  }) {
    super({ client, guard, headers, onError, searchParams, signal, timeout, url })
    this.#limit = limit
  }

  async *execute(): AsyncGenerator<T, void, undefined> {
    yield* this.getPaginated({
      limit: this.#limit,
    })
  }
}

export class ServiceGroupRequestPut<T = void> extends ServiceGroupRequest<T> {
  readonly #body: undefined | JSONReadonlyRecord

  constructor({ body, client, guard, headers, onError, searchParams, signal, timeout, url }: {
    readonly body?: undefined | JSONReadonlyRecord
    readonly client: HTTPClient
    readonly guard: undefined | Guard<T>
    readonly headers: undefined | Record<string, string>
    readonly onError?: undefined | HTTPClientOnErrorHandler
    readonly searchParams: ServiceGroupSearchParams
    readonly signal?: undefined | AbortSignal
    readonly timeout: undefined | number
    readonly url: URL
  }) {
    super({ client, guard, headers, onError, searchParams, signal, timeout, url })
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

  constructor({ body, client, guard, headers, onError, searchParams, signal, timeout, url }: {
    readonly body?: undefined | JSONReadonlyRecord
    readonly client: HTTPClient
    readonly guard: undefined | Guard<T>
    readonly headers: undefined | Record<string, string>
    readonly onError?: undefined | HTTPClientOnErrorHandler
    readonly searchParams: ServiceGroupSearchParams
    readonly signal?: undefined | AbortSignal
    readonly timeout: undefined | number
    readonly url: URL
  }) {
    super({ client, guard, headers, onError, searchParams, signal, timeout, url })
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

async function* fetchPaginatedData<T = unknown>({
  client,
  guard = unknown() as Guard<T>,
  headers,
  limit,
  onError,
  signal,
  timeout,
  url,
}: {
  readonly client: HTTPClient
  readonly guard?: undefined | Guard<T>
  readonly headers?: undefined | Record<string, string>
  readonly limit?: undefined | number
  readonly onError?: HTTPClientOnErrorHandler
  readonly signal?: undefined | AbortSignal
  readonly timeout?: undefined | number
  readonly url: string | URL
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
    coerce: sanitizeSaxobankValue,
    guard: bodyGuard,
    headers,
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
