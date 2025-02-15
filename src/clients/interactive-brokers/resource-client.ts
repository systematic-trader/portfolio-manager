import type { Guard } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { JSONReadonlyRecord } from '../../utils/json.ts'
import { pathJoin } from '../../utils/url.ts'
import type { InteractiveBrokersClient, SearchParamRecord } from './client.ts'

export class InteractiveBrokersResourceClient {
  #path: string
  #client: InteractiveBrokersClient

  constructor({ path, http }: {
    readonly path: string
    readonly http: InteractiveBrokersClient
  }) {
    this.#path = path
    this.#client = http
  }

  appendPath(path: string): InteractiveBrokersResourceClient {
    return new InteractiveBrokersResourceClient({
      path: pathJoin(this.#path, path),
      http: this.#client,
    })
  }

  get<T = unknown>({ path: subpath, ...options }: {
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<T> {
    const path = pathJoin(this.#path, subpath)
    return this.#client.get({ path, ...options })
  }

  post<T = unknown>({ path: subpath, ...options }: {
    readonly body?: JSONReadonlyRecord
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<T> {
    const path = pathJoin(this.#path, subpath)

    return this.#client.post({ path, ...options })
  }

  delete<T = unknown>({ path: subpath, ...options }: {
    readonly body?: JSONReadonlyRecord
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<T> {
    const path = pathJoin(this.#path, subpath)

    return this.#client.delete({ path, ...options })
  }
}
