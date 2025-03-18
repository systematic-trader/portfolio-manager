import { AssertionError, assertReturn, type Guard } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Debug } from '../utils/debug.ts'
import { ensureError } from '../utils/error.ts'
import { stringifyJSON } from '../utils/json.ts'
import { CombinedSignalController } from '../utils/signal.ts'
import { throttle } from '../utils/throttle.ts'
import { Timeout } from '../utils/timeout.ts'

const debug = {
  GET: Debug('http-client:get'),
  POST: Debug('http-client:post'),
  PUT: Debug('http-client:put'),
  PATCH: Debug('http-client:patch'),
  DELETE: Debug('http-client:delete'),
}

type Writable<T> = {
  -readonly [K in keyof T]: T[K]
}

export interface HTTPClientRequest {
  readonly url: URL
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  readonly headers: Headers
  readonly body: undefined | RequestInit['body']
  readonly signal: undefined | AbortSignal
}

export interface HTTPClientOnErrorCallback {
  (
    { request, error, retries }: {
      readonly request: HTTPClientRequest
      readonly error: Error
      readonly retries: number
    },
  ): void | Promise<void>
}

export interface HTTPClientHeadersCallback {
  (
    { request }: { readonly request: HTTPClientRequest },
  ): undefined | HTTPClientHeaders | Promise<undefined | HTTPClientHeaders>
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

export class HTTPServiceResponseInvalidError extends HTTPError {
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  readonly href: string
  readonly headers: Record<string, string>
  readonly body: unknown
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
    let prepend = `${statusCode} ${statusText} - ${method} ${href}\n${stringifyJSON(headers, undefined, 2)}`

    if (typeof body === 'string') {
      prepend = `${prepend}\n${body}`
    }

    if (typeof body === 'object' && body !== null) {
      prepend = `${prepend}\n${stringifyJSON(body, undefined, 2)}`
    }

    super(`${prepend}\n${message}`, statusCode, statusText)
    this.method = method
    this.href = href
    this.body = body
    this.headers = headers
    this.invalidations = invalidations
  }
}

type Fetch = typeof fetch

export type HTTPClientHeaders =
  | Record<string, undefined | null | string>
  | Headers
  | ReadonlyArray<readonly [string, undefined | null | string]>

export interface HTTPClientOptions {
  readonly headers?:
    | undefined
    | HTTPClientHeaders
    | HTTPClientHeadersCallback
  readonly onError?: undefined | HTTPClientOnErrorCallback
  readonly maxPerSecond?: undefined | number
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

  static createHeaders(headers: undefined | HTTPClientHeaders): Headers {
    return this.joinHeaders(headers)
  }

  static joinHeaders(
    first: undefined | HTTPClientHeaders,
    ...rest: ReadonlyArray<undefined | HTTPClientHeaders>
  ): Headers {
    const resultHeaders = new Headers()

    if (first instanceof Headers) {
      for (const [key, value] of first.entries()) {
        if (value.length !== 0) {
          resultHeaders.set(key, value)
        }
      }
    } else if (first instanceof Array) {
      for (const [key, value] of first) {
        if (typeof value === 'string' && value.length !== 0) {
          resultHeaders.set(key, value)
        }
      }
    } else if (first !== undefined) {
      for (const [key, value] of Object.entries(first)) {
        if (typeof value === 'string' && value.length !== 0) {
          resultHeaders.set(key, value)
        }
      }
    }

    for (const headers of rest) {
      if (headers !== undefined) {
        if (headers instanceof Headers) {
          for (const [key, value] of headers.entries()) {
            if (value.length !== 0) {
              resultHeaders.set(key, value)
            }
          }
        } else if (headers instanceof Array) {
          for (const [key, value] of headers) {
            if (typeof value === 'string' && value.length !== 0) {
              resultHeaders.set(key, value)
            }
          }
        } else {
          for (const [key, value] of Object.entries(headers)) {
            if (typeof value === 'string' && value.length !== 0) {
              resultHeaders.set(key, value)
            }
          }
        }
      }
    }

    return resultHeaders
  }

  readonly maxPerSecond: number | undefined
  #fetch: Fetch
  readonly headersCallback: HTTPClientHeadersCallback
  readonly #onError?: HTTPClientOnErrorCallback

  constructor({ headers, onError, maxPerSecond }: HTTPClientOptions = {}) {
    this.headersCallback = typeof headers === 'function' ? headers : ({ request }) => HTTPClient.joinHeaders(headers, request.headers)

    this.#onError = onError
    this.maxPerSecond = maxPerSecond
    this.#fetch = maxPerSecond === undefined ? fetch : throttle(maxPerSecond, fetch)
  }

  extend(options: Partial<HTTPClientOptions> = {}): HTTPClient {
    if (options.maxPerSecond === undefined) {
      const client = new HTTPClient({
        headers: options.headers ?? this.headersCallback,
        onError: options.onError ?? this.#onError,
        maxPerSecond: options.maxPerSecond ?? this.maxPerSecond,
      })

      if (options.maxPerSecond === undefined) {
        client.#fetch = this.#fetch

        return client
      }

      return client
    } else {
      return new HTTPClient({
        headers: options.headers ?? this.headersCallback,
        onError: options.onError ?? this.#onError,
        maxPerSecond: options.maxPerSecond ?? this.maxPerSecond,
      })
    }
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<Response> {
    return await executeRequest(url, {
      method: 'GET',
      headers,
      signal,
      timeout,
      onError,
      headersCallback: this.headersCallback,
      throttledFetch: this.#fetch,
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<Response> {
    return await executeRequest(url, {
      method: 'GET',
      headers,
      signal,
      timeout,
      onError,
      onlyOk: true,
      headersCallback: this.headersCallback,
      throttledFetch: this.#fetch,
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<T> {
    const response = await this.getOk(url, {
      headers: HTTPClient.joinHeaders(
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
      return assertResponseBody(
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
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
      return assertResponseBody(
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<Response> {
    return await executeRequest(url, {
      method: 'POST',
      headers,
      signal,
      timeout,
      onError,
      body,
      headersCallback: this.headersCallback,
      throttledFetch: this.#fetch,
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<Response> {
    return await executeRequest(url, {
      method: 'POST',
      headers,
      signal,
      timeout,
      onError,
      body,
      onlyOk: true,
      headersCallback: this.headersCallback,
      throttledFetch: this.#fetch,
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<T> {
    const response = await this.postOk(url, {
      headers: HTTPClient.joinHeaders(
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
      return assertResponseBody(
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<Response> {
    return await executeRequest(url, {
      method: 'PATCH',
      headers,
      signal,
      timeout,
      onError,
      body,
      headersCallback: this.headersCallback,
      throttledFetch: this.#fetch,
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<Response> {
    return await executeRequest(url, {
      method: 'PATCH',
      headers,
      signal,
      timeout,
      onError,
      body,
      onlyOk: true,
      headersCallback: this.headersCallback,
      throttledFetch: this.#fetch,
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<T> {
    const response = await this.patchOk(url, {
      headers: HTTPClient.joinHeaders(
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
      return assertResponseBody(
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<Response> {
    return await executeRequest(url, {
      method: 'PUT',
      headers,
      signal,
      timeout,
      onError,
      body,
      headersCallback: this.headersCallback,
      throttledFetch: this.#fetch,
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<Response> {
    return await executeRequest(url, {
      method: 'PUT',
      headers,
      signal,
      timeout,
      onError,
      body,
      onlyOk: true,
      headersCallback: this.headersCallback,
      throttledFetch: this.#fetch,
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<T> {
    const response = await this.putOk(url, {
      headers: HTTPClient.joinHeaders(
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
      return assertResponseBody(
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<Response> {
    return await executeRequest(url, {
      method: 'DELETE',
      headers,
      signal,
      timeout,
      onError,
      headersCallback: this.headersCallback,
      throttledFetch: this.#fetch,
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<Response> {
    return await executeRequest(url, {
      method: 'DELETE',
      headers,
      signal,
      timeout,
      onError,
      onlyOk: true,
      headersCallback: this.headersCallback,
      throttledFetch: this.#fetch,
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
      readonly onError?: undefined | HTTPClientOnErrorCallback
    } = {},
  ): Promise<T> {
    const response = await this.deleteOk(url, {
      headers: HTTPClient.joinHeaders(
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
      return assertResponseBody(
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

function assertResponseBody<T>(
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

async function executeRequest(url: string | URL, options: {
  readonly throttledFetch: Fetch
  readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  readonly headers?: undefined | HTTPClientHeaders
  readonly body?: RequestInit['body']
  readonly signal?: undefined | AbortSignal
  readonly timeout?: undefined | number
  readonly onError?: undefined | HTTPClientOnErrorCallback
  readonly onlyOk?: undefined | boolean
  readonly headersCallback?: undefined | HTTPClientHeadersCallback
}): Promise<Response> {
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

  using controller = new CombinedSignalController(
    options.signal,
    timeout?.signal,
  )

  if (controller.signal.aborted === true) {
    if (options.body === undefined || options.body === null) {
      debug[options.method](new URL(url).href)
    } else {
      debug[options.method](new URL(url).href, options.body)
    }

    throw new HTTPClientRequestAbortError(options.method, url.toString())
  }

  const request: Writable<HTTPClientRequest> = {
    url: new URL(url),
    method: options.method,
    headers: HTTPClient.createHeaders(options.headers),
    body: options.body,
    signal: controller.signal,
  }

  return await callFetch(
    request,
    options.throttledFetch,
    options.headersCallback,
    options.onError,
    options.onlyOk,
    0,
  )
}

async function callFetch(
  request: Writable<HTTPClientRequest>,
  throttledFetch: Fetch,
  headersCallback: undefined | HTTPClientHeadersCallback,
  errorCallback: undefined | HTTPClientOnErrorCallback,
  onlyOk: undefined | boolean,
  retries: number,
): Promise<Response> {
  if (request.body === undefined || request.body === null) {
    debug[request.method](request.url.href)
  } else {
    debug[request.method](request.url.href, request.body)
  }

  if (request.signal?.aborted === true) {
    throw new HTTPClientRequestAbortError(request.method, request.url.href)
  }

  const requestHeaders = request.headers

  if (headersCallback !== undefined) {
    request.headers = HTTPClient.createHeaders(await headersCallback({ request }))
  }

  try {
    const response = await throttledFetch(request.url, {
      method: request.method,
      body: request.body,
      headers: request.headers,
      signal: request.signal,
    })

    if (onlyOk === true) {
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
            request.method,
            request.url.href,
            response.status,
            response.statusText,
            responseHeaders,
            body,
          )
        }

        throw new HTTPClientError(
          request.method,
          request.url.href,
          response.status,
          response.statusText,
          responseHeaders,
          body,
        )
      }
    }

    return response
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        const abortError = new HTTPClientRequestAbortError(request.method, request.url.href)

        const stack = error.stack?.split('\n').slice(1).join('\n')

        abortError.stack = abortError.message === '' ? `${abortError.name}\n${stack}` : `${abortError.name}: ${abortError.message}\n${stack}`

        // deno-lint-ignore no-ex-assign
        error = abortError
      }
    } else {
      // deno-lint-ignore no-ex-assign
      error = ensureError(error)
    }

    if (errorCallback === undefined) {
      throw error
    }

    await errorCallback({ request, error: error as Error, retries })

    request.headers = requestHeaders

    return await callFetch(request, throttledFetch, headersCallback, errorCallback, onlyOk, retries++)
  }
}
