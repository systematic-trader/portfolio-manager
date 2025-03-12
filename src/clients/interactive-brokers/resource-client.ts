import type { Guard } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { type JSONReadonlyRecord, stringifyJSON } from '../../utils/json.ts'
import { urlJoin } from '../../utils/url.ts'
import type { HTTPClient } from '../http-client.ts'

export type SearchParamValue = undefined | boolean | number | string | ReadonlyArray<number | string | boolean>

export type SearchParamRecord = Record<string, SearchParamValue>

export class InteractiveBrokersResourceClient {
  readonly #http: HTTPClient
  readonly #url: URL

  readonly accountID: string

  constructor({ url, http, accountID }: {
    readonly url: string | URL
    readonly http: HTTPClient
    readonly accountID: string
  }) {
    this.#http = http
    this.#url = new URL(url)
    this.accountID = accountID
  }

  appendPath(path: string): InteractiveBrokersResourceClient {
    return new InteractiveBrokersResourceClient({
      http: this.#http,
      url: urlJoin(this.#url, path),
      accountID: this.accountID,
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
    return this.#http.getOkJSON(
      createFullURL(this.#url, options.path, options.searchParams),
      { ...options, coerce: sanitize },
    )
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
      coerce: sanitize,
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
    return this.#http.deleteOkJSON(createFullURL(this.#url, options.path, options.searchParams), {
      ...options,
      coerce: sanitize,
    })
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

/**
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
