import type { Guard } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { type JSONReadonlyRecord, stringifyJSON } from '../../utils/json.ts'
import { urlJoin } from '../../utils/url.ts'
import type { HTTPClient } from '../http-client.ts'

export type SearchParamValue = undefined | boolean | number | string | ReadonlyArray<number | string | boolean>

export type SearchParamRecord = Record<string, SearchParamValue>

export class InteractiveBrokersResourceClient {
  readonly #http: HTTPClient
  readonly #url: URL

  constructor({ url, http }: {
    readonly url: string | URL
    readonly http: HTTPClient
  }) {
    this.#http = http
    this.#url = new URL(url)
  }

  appendPath(path: string): InteractiveBrokersResourceClient {
    return new InteractiveBrokersResourceClient({
      http: this.#http,
      url: urlJoin(this.#url, path),
    })
  }

  get<T = unknown>(options: {
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<T> {
    return this.#http.getOkJSON(createFullURL(this.#url, options.path, options.searchParams), options)
  }

  post<T = unknown>(options: {
    readonly body?: JSONReadonlyRecord
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<T> {
    return this.#http.postOkJSON(createFullURL(this.#url, options.path, options.searchParams), {
      ...options,
      body: stringifyJSON(options.body),
    })
  }

  delete<T = unknown>(options: {
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<T> {
    return this.#http.deleteOkJSON(createFullURL(this.#url, options.path, options.searchParams), options)
  }
}

function createFullURL(baseURL: URL, path: undefined | string, searchParams: undefined | SearchParamRecord): URL {
  const url = urlJoin(baseURL, path)

  if (searchParams !== undefined) {
    const params = new URLSearchParams()

    for (const key in searchParams) {
      const value = searchParams[key]

      if (value !== undefined) {
        params.append(key, String(value))
      }
    }

    url.search = params.toString()
  }

  return url
}
