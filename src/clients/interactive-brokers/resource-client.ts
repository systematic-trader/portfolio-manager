import type { Guard } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { type JSONReadonlyRecord, stringifyJSON } from '../../utils/json.ts'
import { urlJoin } from '../../utils/url.ts'
import type { HTTPClient } from '../http-client.ts'
import type { SearchParamRecord } from './client-old.ts'

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
    return this.#http.getOkJSON(urlJoin(this.#url, options.path), options)
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
    return this.#http.postOkJSON(urlJoin(this.#url, options.path), { ...options, body: stringifyJSON(options.body) })
  }

  delete<T = unknown>(options: {
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<T> {
    return this.#http.deleteOkJSON(urlJoin(this.#url, options.path), options)
  }
}
