import {
  AssertionError,
  assertReturn,
  type Guard,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Debug } from '../utils/debug.ts'
import { ensureError } from '../utils/error.ts'
import { stringifyJSON } from '../utils/json.ts'
import { mergeAbortSignals } from '../utils/signal.ts'
import { Timeout } from '../utils/timeout.ts'

const debug = {
  GET: Debug('http-client:get'),
  POST: Debug('http-client:post'),
  PUT: Debug('http-client:put'),
  PATCH: Debug('http-client:patch'),
  DELETE: Debug('http-client:delete'),
}

function assertReturnBody<T>(
  guard: Guard<T>,
  body: unknown,
  method: HTTPServiceResponseInvalidError['method'],
  href: HTTPServiceResponseInvalidError['href'],
  headers: HTTPServiceResponseInvalidError['headers'],
  statusCode: HTTPServiceResponseInvalidError['statusCode'],
  statusText: HTTPServiceResponseInvalidError['statusText'],
): T {
  try {
    return assertReturn(guard, body)
  } catch (error) {
    if (error instanceof AssertionError) {
      throw new HTTPServiceResponseInvalidError(
        error.message,
        method,
        href,
        statusCode,
        statusText,
        headers,
        body,
        error.invalidations,
      )
    }

    throw error
  }
}

export interface HTTPClientOnErrorHandler {
  (error: Error, retries: number): void | Promise<void>
}

export abstract class HTTPError extends Error {
  readonly statusCode: number
  readonly statusText: string

  constructor(message: HTTPError['message'], statusCode: HTTPError['statusCode'], statusText: HTTPError['statusText']) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.statusText = statusText
  }
}

export class HTTPClientError extends HTTPError {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  readonly href: string
  readonly headers: Record<string, string>
  readonly body: unknown

  constructor(
    method: HTTPClientError['method'],
    href: string,
    statusCode: HTTPClientError['statusCode'],
    statusText: HTTPClientError['statusText'],
    headers: HTTPClientError['headers'],
    body: HTTPClientError['body'],
  ) {
    let message = `${statusCode} ${statusText} - ${method} ${href}\n${stringifyJSON(headers, undefined, 2)}`

    if (typeof body === 'string') {
      message = `${message}\n${body}`
    }

    if (typeof body === 'object' && body !== null) {
      message = `${message}\n${stringifyJSON(body, undefined, 2)}`
    }

    super(message, statusCode, statusText)
    this.body = body
    this.href = href
    this.method = method
    this.headers = headers
  }
}

export class HTTPClientRequestAbortError extends Error {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  readonly href: string

  constructor(
    method: HTTPClientRequestAbortError['method'],
    href: HTTPClientRequestAbortError['href'],
  ) {
    super(`Aborted ${method} ${href}`)
    this.name = this.constructor.name
    this.method = method
    this.href = href
  }
}

export class HTTPServiceError extends HTTPError {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  readonly href: string
  readonly headers: Record<string, string>
  readonly body: unknown

  constructor(
    method: HTTPServiceError['method'],
    href: HTTPServiceError['href'],
    statusCode: HTTPServiceError['statusCode'],
    statusText: HTTPServiceError['statusText'],
    headers: HTTPServiceError['headers'],
    body: HTTPServiceError['body'],
  ) {
    let message = `${statusCode} ${statusText} - ${method} ${href}\n${stringifyJSON(headers, undefined, 2)}`

    if (typeof body === 'string') {
      message = `${message}\n${body}`
    }

    if (typeof body === 'object' && body !== null) {
      message = `${message}\n${stringifyJSON(body, undefined, 2)}`
    }

    super(message, statusCode, statusText)
    this.method = method
    this.href = href
    this.body = body
    this.headers = headers
  }
}

export class HTTPServiceResponseInvalidError extends HTTPServiceError {
  readonly invalidations: readonly unknown[]

  constructor(
    message: string,
    method: HTTPServiceResponseInvalidError['method'],
    href: HTTPServiceResponseInvalidError['href'],
    statusCode: HTTPServiceResponseInvalidError['statusCode'],
    statusText: HTTPServiceResponseInvalidError['statusText'],
    headers: HTTPServiceResponseInvalidError['headers'],
    body: HTTPServiceResponseInvalidError['body'],
    invalidations: HTTPServiceResponseInvalidError['invalidations'],
  ) {
    super(method, href, statusCode, statusText, headers, body)
    this.invalidations = invalidations
    this.message = `${this.message}\n${message}`
  }
}

export type HTTPClientHeaders = Record<string, undefined | string> | Headers
export interface HTTPClientHeadersOptions {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  readonly url: string
  readonly signal: undefined | AbortSignal
}

export class HTTPClient {
  static #client = new HTTPClient()

  static get = HTTPClient.#client.get.bind(HTTPClient.#client)
  static getOk = HTTPClient.#client.getOk.bind(HTTPClient.#client)
  static getOkJSON = HTTPClient.#client.getOkJSON.bind(HTTPClient.#client)
  static getOkBlob = HTTPClient.#client.getOkBlob.bind(HTTPClient.#client)
  static getOkText = HTTPClient.#client.getOkText.bind(HTTPClient.#client)
  static post = HTTPClient.#client.post.bind(HTTPClient.#client)
  static postOk = HTTPClient.#client.postOk.bind(HTTPClient.#client)
  static postOkJSON = HTTPClient.#client.postOkJSON.bind(HTTPClient.#client)
  static patch = HTTPClient.#client.patch.bind(HTTPClient.#client)
  static patchOk = HTTPClient.#client.patchOk.bind(HTTPClient.#client)
  static patchOkJSON = HTTPClient.#client.patchOkJSON.bind(HTTPClient.#client)
  static put = HTTPClient.#client.put.bind(HTTPClient.#client)
  static putOk = HTTPClient.#client.putOk.bind(HTTPClient.#client)
  static putOkJSON = HTTPClient.#client.putOkJSON.bind(HTTPClient.#client)
  static delete = HTTPClient.#client.delete.bind(HTTPClient.#client)
  static deleteOk = HTTPClient.#client.deleteOk.bind(HTTPClient.#client)
  static deleteOkJSON = HTTPClient.#client.deleteOkJSON.bind(HTTPClient.#client)

  readonly createHeaders: (options: HTTPClientHeadersOptions) => Promise<Headers>
  readonly #onError?: HTTPClientOnErrorHandler

  constructor({ headers, onError }: {
    readonly headers?:
      | undefined
      | HTTPClientHeaders
      | ((options: HTTPClientHeadersOptions) => undefined | HTTPClientHeaders | Promise<undefined | HTTPClientHeaders>)
    readonly onError?: undefined | HTTPClientOnErrorHandler
  } = {}) {
    this.createHeaders = typeof headers === 'function'
      ? async (options: HTTPClientHeadersOptions) => mergeHeaders(new Headers(), await headers(options))
      : () => Promise.resolve(mergeHeaders(new Headers(), headers))

    this.#onError = onError
  }

  async get(
    url: string | URL,
    {
      headers,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly headers?: undefined | HTTPClientHeaders
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<Response> {
    return await fetchResponse(this, url, {
      method: 'GET',
      headers,
      signal,
      timeout,
      onError,
    })
  }

  async getOk(
    url: string | URL,
    {
      headers,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly headers?: undefined | HTTPClientHeaders
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<Response> {
    return await fetchOkResponse(this, url, {
      method: 'GET',
      headers,
      signal,
      timeout,
      onError,
    })
  }

  async getOkJSON<T = unknown>(
    url: string | URL,
    {
      guard,
      headers,
      coerce,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly guard?: undefined | Guard<T>
      readonly headers?: undefined | HTTPClientHeaders
      readonly coerce?: undefined | ((body: unknown) => unknown)
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<T> {
    const response = await this.getOk(url, {
      headers: mergeHeaders(
        { 'accept': 'application/json' },
        headers,
      ),
      signal,
      timeout,
      onError,
    })

    let body = await response?.json()

    if (coerce !== undefined) {
      body = coerce(body)
    }

    if (guard !== undefined) {
      return assertReturnBody(
        guard,
        body,
        'GET',
        url instanceof URL ? url.href : url,
        Object.fromEntries(response.headers),
        response.status,
        response.statusText,
      )
    }

    return body
  }

  async getOkBlob(
    url: string | URL,
    {
      headers,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly headers?: undefined | HTTPClientHeaders
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<Blob> {
    const response = await this.getOk(url, {
      headers,
      signal,
      timeout,
      onError,
    })

    return await response.blob()
  }

  async getOkText(
    url: string | URL,
    {
      guard,
      headers,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly guard?: undefined | Guard<string>
      readonly headers?: undefined | HTTPClientHeaders
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<string> {
    const response = await this.getOk(url, {
      headers,
      signal,
      timeout,
      onError,
    })

    const text = await response.text()

    if (guard !== undefined) {
      return assertReturnBody(
        guard,
        text,
        'GET',
        url instanceof URL ? url.href : url,
        Object.fromEntries(response.headers),
        response.status,
        response.statusText,
      )
    }

    return text
  }

  async post(
    url: string | URL,
    {
      headers,
      body,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly headers?: undefined | HTTPClientHeaders
      readonly body?: RequestInit['body']
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<Response> {
    return await fetchResponse(this, url, {
      method: 'POST',
      headers,
      signal,
      timeout,
      onError,
      body,
    })
  }

  async postOk(
    url: string | URL,
    {
      headers,
      body,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly headers?: undefined | HTTPClientHeaders
      readonly body?: RequestInit['body']
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<Response> {
    return await fetchOkResponse(this, url, {
      method: 'POST',
      headers,
      signal,
      timeout,
      onError,
      body,
    })
  }

  async postOkJSON<T = unknown>(
    url: string | URL,
    {
      guard,
      headers,
      body,
      coerce,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly guard?: undefined | Guard<T>
      readonly headers?: undefined | HTTPClientHeaders
      readonly body?: RequestInit['body']
      readonly coerce?: undefined | ((body: unknown) => unknown)
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<T> {
    const response = await this.postOk(url, {
      headers: mergeHeaders(
        {
          'accept': 'application/json',
          'content-type': 'application/json; charset=utf-8',
        },
        headers,
      ),
      signal,
      timeout,
      onError,
      body,
    })

    let responseBody = response.status === 204
      ? undefined
      : response.headers.get('Content-Length') === '0'
      ? await response.body?.cancel().then(() => undefined)
      : await response.json()

    if (coerce !== undefined) {
      responseBody = coerce(responseBody)
    }

    if (guard !== undefined) {
      return assertReturnBody(
        guard,
        responseBody,
        'POST',
        url instanceof URL ? url.href : url,
        Object.fromEntries(response.headers),
        response.status,
        response.statusText,
      )
    }

    return responseBody
  }

  async patch(
    url: string | URL,
    {
      headers,
      body,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly headers?: undefined | HTTPClientHeaders
      readonly body?: RequestInit['body']
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<Response> {
    return await fetchResponse(this, url, {
      method: 'PATCH',
      headers,
      signal,
      timeout,
      onError,
      body,
    })
  }

  async patchOk(
    url: string | URL,
    {
      headers,
      body,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly headers?: undefined | HTTPClientHeaders
      readonly body?: RequestInit['body']
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<Response> {
    return await fetchOkResponse(this, url, {
      method: 'PATCH',
      headers,
      signal,
      timeout,
      onError,
      body,
    })
  }

  async patchOkJSON<T = unknown>(
    url: string | URL,
    {
      guard,
      headers,
      body,
      coerce,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly guard?: undefined | Guard<T>
      readonly headers?: undefined | HTTPClientHeaders
      readonly body?: RequestInit['body']
      readonly coerce?: undefined | ((body: unknown) => unknown)
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<T> {
    const response = await this.patchOk(url, {
      headers: mergeHeaders(
        {
          'accept': 'application/json',
          'content-type': 'application/json; charset=utf-8',
        },
        headers,
      ),
      signal,
      timeout,
      onError,
      body,
    })

    let responseBody = response.status === 204
      ? undefined
      : response.headers.get('Content-Length') === '0'
      ? await response.body?.cancel().then(() => undefined)
      : await response.json()

    if (coerce !== undefined) {
      responseBody = coerce(responseBody)
    }

    if (guard !== undefined) {
      return assertReturnBody(
        guard,
        responseBody,
        'PATCH',
        url instanceof URL ? url.href : url,
        Object.fromEntries(response.headers),
        response.status,
        response.statusText,
      )
    }

    return responseBody
  }

  async put(
    url: string | URL,
    {
      headers,
      body,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly headers?: undefined | HTTPClientHeaders
      readonly body?: RequestInit['body']
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<Response> {
    return await fetchResponse(this, url, {
      method: 'PUT',
      headers,
      signal,
      timeout,
      onError,
      body,
    })
  }

  async putOk(
    url: string | URL,
    {
      headers,
      body,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly headers?: undefined | HTTPClientHeaders
      readonly body?: RequestInit['body']
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<Response> {
    return await fetchOkResponse(this, url, {
      method: 'PUT',
      headers,
      signal,
      timeout,
      onError,
      body,
    })
  }

  async putOkJSON<T = unknown>(
    url: string | URL,
    {
      guard,
      headers,
      body,
      coerce,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly guard?: undefined | Guard<T>
      readonly headers?: undefined | HTTPClientHeaders
      readonly body?: RequestInit['body']
      readonly coerce?: undefined | ((body: unknown) => unknown)
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<T> {
    const response = await this.putOk(url, {
      headers: mergeHeaders(
        {
          'accept': 'application/json',
          'content-type': 'application/json; charset=utf-8',
        },
        headers,
      ),
      signal,
      timeout,
      onError,
      body,
    })

    let responseBody = response.status === 204
      ? undefined
      : response.headers.get('Content-Length') === '0'
      ? await response.body?.cancel().then(() => undefined)
      : await response.json()

    if (coerce !== undefined) {
      responseBody = coerce(responseBody)
    }

    if (guard !== undefined) {
      return assertReturnBody(
        guard,
        responseBody,
        'PUT',
        url instanceof URL ? url.href : url,
        Object.fromEntries(response.headers),
        response.status,
        response.statusText,
      )
    }

    return responseBody
  }

  async delete(
    url: string | URL,
    {
      headers,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly headers?: undefined | HTTPClientHeaders
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<Response> {
    return await fetchResponse(this, url, {
      method: 'DELETE',
      headers,
      signal,
      timeout,
      onError,
    })
  }

  async deleteOk(
    url: string | URL,
    {
      headers,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly headers?: undefined | HTTPClientHeaders
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<Response> {
    return await fetchOkResponse(this, url, {
      method: 'DELETE',
      headers,
      signal,
      timeout,
      onError,
    })
  }

  async deleteOkJSON<T = unknown>(
    url: string | URL,
    {
      guard,
      headers,
      coerce,
      signal,
      timeout,
      onError = this.#onError,
    }: {
      readonly guard?: undefined | Guard<T>
      readonly headers?: undefined | HTTPClientHeaders
      readonly coerce?: undefined | ((body: unknown) => unknown)
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
      readonly onError?: undefined | HTTPClientOnErrorHandler
    } = {},
  ): Promise<T> {
    const response = await this.deleteOk(url, {
      headers: mergeHeaders(
        { 'accept': 'application/json' },
        headers,
      ),
      signal,
      timeout,
      onError,
    })

    let responseBody = response.status === 204
      ? undefined
      : response.headers.get('Content-Length') === '0'
      ? await response.body?.cancel().then(() => undefined)
      : await response.json()

    if (coerce !== undefined) {
      responseBody = coerce(responseBody)
    }

    if (guard !== undefined) {
      return assertReturnBody(
        guard,
        responseBody,
        'DELETE',
        url instanceof URL ? url.href : url,
        Object.fromEntries(response.headers),
        response.status,
        response.statusText,
      )
    }

    return responseBody
  }
}

function mergeHeaders(
  first: HeadersInit,
  ...rest: ReadonlyArray<HTTPClientHeaders | undefined>
): Headers {
  const resultHeaders = new Headers(first)

  for (const headers of rest) {
    if (headers !== undefined) {
      if (headers instanceof Headers) {
        for (const [key, value] of headers.entries()) {
          resultHeaders.set(key, value)
        }
      } else {
        for (const [key, value] of Object.entries(headers)) {
          if (typeof value === 'string') {
            resultHeaders.set(key, value)
          }
        }
      }
    }
  }

  for (const [key, value] of resultHeaders.entries()) {
    if (value.length === 0) {
      resultHeaders.delete(key)
    } else {
      resultHeaders.set(key, value)
    }
  }

  return resultHeaders
}

async function fetchResponse(client: HTTPClient, url: string | URL, options: {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  readonly headers?: undefined | HTTPClientHeaders
  readonly body?: RequestInit['body']
  readonly signal?: undefined | AbortSignal
  readonly timeout?: undefined | number
  readonly onError?: undefined | HTTPClientOnErrorHandler
}, retries = 0): Promise<Response> {
  if (
    options.timeout !== undefined &&
    (
      Number.isSafeInteger(options.timeout) === false ||
      options.timeout < 1
    )
  ) {
    throw new TypeError(`Expected timeout to be a positive integer, got ${options.timeout}`)
  }

  if (options.body === undefined) {
    debug[options.method](new URL(url).href)
  } else {
    debug[options.method](new URL(url).href, options.body)
  }

  using timeout = options.timeout === undefined ? undefined : Timeout.wait(options.timeout)

  const signal = mergeAbortSignals(
    options.signal,
    timeout?.signal,
  )
  const { onError, method, body, headers } = options

  try {
    if (signal !== undefined && signal.aborted === true) {
      throw new HTTPClientRequestAbortError(options.method, url.toString())
    }

    const readyHeaders = mergeHeaders(
      await client.createHeaders({
        method: options.method,
        url: new URL(url).href,
        signal,
      }),
      headers,
    )

    const response = await fetch(url, {
      method,
      body,
      headers: readyHeaders,
      signal,
    })

    return response
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        const abortError = new HTTPClientRequestAbortError(method, url.toString())

        const stack = error.stack?.split('\n').slice(1).join('\n')

        abortError.stack = abortError.message === ''
          ? `${abortError.name}\n${stack}`
          : `${abortError.name}: ${abortError.message}\n${stack}`

        // deno-lint-ignore no-ex-assign
        error = abortError
      }
    } else {
      // deno-lint-ignore no-ex-assign
      error = ensureError(error)
    }

    if (onError === undefined) {
      throw error
    }

    await onError(error as Error, retries)

    return await fetchResponse(client, url, { onError, method, body, headers, signal }, retries++)
  }
}

async function fetchOkResponse(client: HTTPClient, url: string | URL, options: {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  readonly headers?: undefined | HTTPClientHeaders
  readonly body?: RequestInit['body']
  readonly signal?: undefined | AbortSignal
  readonly timeout?: undefined | number
  readonly onError?: undefined | HTTPClientOnErrorHandler
}, retries = 0): Promise<Response> {
  if (
    options.timeout !== undefined &&
    (
      Number.isSafeInteger(options.timeout) === false ||
      options.timeout < 1
    )
  ) {
    throw new TypeError(`Expected timeout to be a positive integer, got ${options.timeout}`)
  }

  using timeout = options.timeout === undefined ? undefined : Timeout.wait(options.timeout)

  const signal = mergeAbortSignals(
    options.signal,
    timeout?.signal,
  )

  const { onError, method, body, headers } = options

  try {
    const response = await fetchResponse(client, url, { method, body, headers, signal })

    const responseHeaders = Object.fromEntries(response.headers.entries())

    if (response.ok === false) {
      const body = response.headers
          .get('Content-Type')
          ?.toLocaleLowerCase()
          .includes('application/json')
        ? await response.json()
        : await response.text()

      if (response.status >= 500) {
        throw new HTTPServiceError(
          method,
          url instanceof URL ? url.href : url,
          response.status,
          response.statusText,
          responseHeaders,
          body,
        )
      }

      throw new HTTPClientError(
        method,
        response.url,
        response.status,
        response.statusText,
        responseHeaders,
        body,
      )
    }

    return response
  } catch (error) {
    if (onError === undefined) {
      throw error
    }

    await onError(ensureError(error), retries)

    return await fetchOkResponse(client, url, { onError, method, body, headers, signal }, retries++)
  }
}
