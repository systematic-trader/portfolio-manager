import {
  boolean,
  type GuardType,
  integer,
  optional,
  props,
  string,
  unknown,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import { Debug } from '../../utils/debug.ts'
import { ensureError } from '../../utils/error.ts'
import { EventSwitch } from '../../utils/event-switch.ts'
import { PromiseQueue } from '../../utils/promise-queue.ts'
import { CombinedSignalController } from '../../utils/signal.ts'
import { Timeout } from '../../utils/timeout.ts'
import { urlJoin } from '../../utils/url.ts'
import { HTTPClient, HTTPClientRequestAbortError } from '../http-client.ts'
import { StatusResponse } from './resources/iserver/auth/status.ts'
import { SuppressibleMessageIdValues } from './types/derived/suppressible-message-ids.ts'
import { ServerInfo } from './types/record/server-info.ts'

const PROMISE_VOID = Promise.resolve()

const debug = {
  session: {
    authorizationHeader: Debug('ib-client:session:authorization-header'),
    login: Debug('ib-client:session:login'),
    reset: Debug('ib-client:session:reset'),
    dispose: Debug('ib-client:session:dispose'),
    tickle: Debug('ib-client:session:tickle'),
    error: Debug('ib-client:session:error'),
  },
}

const LiveSessionTokenResponse = props({
  diffie_hellman_response: string(),
  live_session_token_signature: string(),
  live_session_token_expiration: integer(), // epoch time in ms
})

const LoginResponse = props({
  passed: optional(boolean()),
  authenticated: boolean(),
  connected: boolean(),
  competing: boolean(),
  hardware_info: optional(string()),
  MAC: optional(string()),
  message: optional(string()),
  serverInfo: optional(ServerInfo),
})

interface LoginResponse extends GuardType<typeof LoginResponse> {}

const TickleResponse = props({
  session: string(),
  hmds: unknown(),
  iserver: props({
    authStatus: StatusResponse,
  }),
})

interface TickleResponse extends GuardType<typeof TickleResponse> {}

export class InteractiveBrokersOAuth1a extends EventSwitch<
  {
    readonly 'live-session-token': readonly [token: string]
    readonly 'tickle-session-token': readonly [token: string]
    readonly disposed: readonly []
  }
> implements AsyncDisposable {
  readonly #queue: PromiseQueue

  readonly #options: {
    readonly accountId: string
    readonly baseURL: URL
    readonly consumerKey: string
    readonly accessToken: string
    readonly accessTokenSecret: string
    readonly diffieHellmanPrime: string
    readonly realm: string
    readonly decryptedAccessTokenSecret: string
    readonly privateSignatureKey: string
  }

  #controller: AbortController
  #error: undefined | Error
  #loginPromise:
    | undefined
    | Promise<{
      liveSessionToken: string
      liveSessionTokenExpiration: number
      tickleSessionToken: string
    }>
  #disposePromise: undefined | Promise<void>
  #ticklePromise: Timeout<void>

  get signal(): AbortSignal {
    return this.#controller.signal
  }

  get error(): undefined | Error {
    return this.#error
  }

  get status(): 'active' | 'disposed' {
    return this.#controller.signal.aborted ? 'disposed' : 'active'
  }

  #active: undefined | {
    liveSessionToken: string
    liveSessionTokenExpiration: number
    tickleSessionToken: string
  }

  constructor(options: {
    readonly accountId: string
    readonly baseURL: URL
    readonly consumerKey: string
    readonly accessToken: string
    readonly accessTokenSecret: string
    readonly diffieHellmanPrime: string
    readonly realm: string
    readonly decryptedAccessTokenSecret: string
    readonly privateSignatureKey: string
  }) {
    const queue = new PromiseQueue((error) => {
      if (this.#error === undefined) {
        this.#error = ensureError(error)
      }

      this.dispose().catch(() => {})
    })

    super(queue)

    this.#queue = queue
    this.#options = options
    this.#controller = new AbortController()
    this.#error = undefined
    this.#loginPromise = undefined
    this.#disposePromise = undefined
    this.#active = undefined

    this.#ticklePromise = Timeout.repeat(60 * 1000, async (signal) => {
      using controller = new CombinedSignalController(this.#controller.signal, signal)

      if (
        this.#controller.signal.aborted ||
        this.#active === undefined ||
        this.#loginPromise !== undefined // new session tokens are being generated
      ) {
        return
      }

      debug.session.tickle(this.#options.accountId, 'token check')

      try {
        const response = await this.#tickle({
          liveSessionToken: this.#active.liveSessionToken,
          signal: controller.signal,
        })

        if (
          response.iserver.authStatus.authenticated !== true &&
          response.iserver.authStatus.connected !== true
        ) {
          debug.session.tickle(this.#options.accountId, 'token invalid')

          this.#active = undefined
        } else {
          debug.session.tickle(this.#options.accountId, 'token valid')

          if (this.#active.tickleSessionToken !== response.session) {
            this.#active.tickleSessionToken = response.session

            this.emit('tickle-session-token', response.session)
          }
        }
      } catch (error) {
        if (error instanceof HTTPClientRequestAbortError) {
          return
        }

        this.dispose().catch(() => {})

        throw error
      }
    })
  }

  async #logout({ liveSessionToken }: { readonly liveSessionToken: string }): Promise<boolean> {
    const logoutUrl = urlJoin(this.#options.baseURL, 'v1/api/logout')

    const response = await HTTPClient.postOkJSON(logoutUrl, {
      headers: {
        Authorization: generateSignedAuthorizationHeader({
          method: 'POST',
          url: logoutUrl,
          signatureMethod: 'HMAC-SHA256',
          liveSessionToken: liveSessionToken,
          accessToken: this.#options.accessToken,
          consumerKey: this.#options.consumerKey,
          realm: this.#options.realm,
        }),
      },
      guard: props({ status: boolean() }, { extendable: true }),
    })

    return response.status
  }

  override [Symbol.asyncDispose](): Promise<void> {
    if (this.#disposePromise !== undefined) {
      return this.#disposePromise
    }

    if (this.#controller.signal.aborted) {
      return PROMISE_VOID
    }

    this.#controller.abort()
    this.#ticklePromise.abort()

    const liveSessionTokenPromise = this.#loginPromise

    this.#loginPromise = undefined

    return this.#disposePromise = Promise.allSettled([liveSessionTokenPromise, this.#ticklePromise]).then(
      async ([sessionResult, tickleResult]) => {
        if (sessionResult.status === 'fulfilled' && this.#active !== undefined) {
          debug.session.dispose(this.#options.accountId, 'logout')
          await this.#logout({ liveSessionToken: this.#active.liveSessionToken })
        } else if (sessionResult.status === 'rejected') {
          throw sessionResult.reason
        }

        if (tickleResult.status === 'rejected') {
          throw tickleResult.reason
        }
      },
    ).catch((error) => {
      if (error instanceof HTTPClientRequestAbortError) {
        return
      }

      if (this.#error === undefined) {
        this.#error = ensureError(error)
      }
    }).finally(() => {
      this.#loginPromise = undefined
      this.#active = undefined
      this.#disposePromise = undefined
    }).then(() => {
      super.emit('disposed')

      return super[Symbol.asyncDispose]()
    }).finally(() => {
      return this.#queue.drain()
    })
  }

  /**
   * Disposes the instance.
   */
  dispose(): Promise<void> {
    return this[Symbol.asyncDispose]()
  }

  async #warmUp({ liveSessionToken }: { readonly liveSessionToken: string }): Promise<void> {
    const accountsURL = urlJoin(this.#options.baseURL, 'v1/api/iserver/accounts')

    // Silly (but required) warm-up specified by IBKR
    while (true) {
      const response = await HTTPClient.getOkJSON(accountsURL, {
        headers: {
          Authorization: generateSignedAuthorizationHeader({
            signatureMethod: 'HMAC-SHA256',
            method: 'GET',
            liveSessionToken: liveSessionToken,
            url: accountsURL,
            accessToken: this.#options.accessToken,
            consumerKey: this.#options.consumerKey,
            realm: this.#options.realm,
          }),
        },
        signal: this.#controller.signal,
      })

      if (typeof response === 'object' && response !== null && 'accounts' in response) {
        break
      }

      await Timeout.wait(1000)
    }

    // Suppress any order confirmational questions from IBKR.
    // If these messages are not suppressed at startup,
    // additional confirmation requests will add unacceptable latency to order execution.
    // Note: IBKR does not persist these suppressions between sessions
    const suppressQuestionsURL = urlJoin(this.#options.baseURL, 'v1/api/iserver/questions/suppress')
    const suppressQuestionsResponsePromise = HTTPClient.postOkJSON(suppressQuestionsURL, {
      headers: {
        Authorization: generateSignedAuthorizationHeader({
          signatureMethod: 'HMAC-SHA256',
          method: 'POST',
          liveSessionToken: liveSessionToken,
          url: suppressQuestionsURL,
          accessToken: this.#options.accessToken,
          consumerKey: this.#options.consumerKey,
          realm: this.#options.realm,
        }),
      },
      body: JSON.stringify({
        messageIds: SuppressibleMessageIdValues,
      }),
      signal: this.#controller.signal,
    }).then((suppressQuestionsResponse) => {
      if (
        typeof suppressQuestionsResponse !== 'object' ||
        suppressQuestionsResponse === null ||
        ('status' in suppressQuestionsResponse && suppressQuestionsResponse.status === 'submitted') === false
      ) {
        throw new Error('Could not suppress confirmational questions')
      }

      return suppressQuestionsResponse
    })

    // Preload the orders endpoint with an initial request
    // The endpoint behavior:
    // - First call: Always returns an empty array regardless of order existence
    // - Subsequent calls: Returns actual orders if they exist
    //
    // This initial call ensures the endpoint is properly initialized.
    // Without this warmup, we cannot reliably determine if a user truly has no orders
    // or if the endpoint simply hasn't been activated yet.
    const ordersURL = urlJoin(this.#options.baseURL, 'v1/api/iserver/account/orders')
    const ordersPromise = HTTPClient.getOkJSON(ordersURL, {
      headers: {
        Authorization: generateSignedAuthorizationHeader({
          signatureMethod: 'HMAC-SHA256',
          method: 'GET',
          liveSessionToken: liveSessionToken,
          url: suppressQuestionsURL,
          accessToken: this.#options.accessToken,
          consumerKey: this.#options.consumerKey,
          realm: this.#options.realm,
        }),
      },
      signal: this.#controller.signal,
    }).then((ordersResponse) => {
      if (
        typeof ordersResponse !== 'object' ||
        ordersResponse === null ||
        ('orders' in ordersResponse) === false
      ) {
        throw new Error('Unexpected response during warm-up of orders endpoint')
      }

      return ordersResponse
    })

    // Wait for all warm-up requests to complete
    for (const result of await Promise.allSettled([suppressQuestionsResponsePromise, ordersPromise])) {
      if (result.status === 'rejected') {
        throw result.reason
      }
    }

    // TODO more warm-up
  }

  async #tickle(
    { liveSessionToken, signal }: { readonly liveSessionToken: string; readonly signal?: undefined | AbortSignal },
  ): Promise<TickleResponse> {
    const tickleUrl = urlJoin(this.#options.baseURL, 'v1/api/tickle')

    const response = await HTTPClient.postOkJSON(tickleUrl, {
      headers: {
        Authorization: generateSignedAuthorizationHeader({
          signatureMethod: 'HMAC-SHA256',
          method: 'POST',
          liveSessionToken,
          url: tickleUrl,
          accessToken: this.#options.accessToken,
          consumerKey: this.#options.consumerKey,
          realm: this.#options.realm,
        }),
      },
      guard: TickleResponse,
      signal,
    })

    return response
  }

  /**
   * Authorizes and retrieves a live session token if one is not already available.
   *
   * @returns The live session token as a string.
   */
  // deno-lint-ignore require-await
  async #ensureActiveSession(): Promise<{
    liveSessionToken: string
    liveSessionTokenExpiration: number
    tickleSessionToken: string
  }> {
    if (this.#loginPromise !== undefined) {
      return this.#loginPromise
    }

    if (this.#controller.signal.aborted) {
      throw new Error(`${this.constructor.name} is disposed`)
    }

    if (this.#error !== undefined) {
      throw this.#error
    }

    if (this.#active !== undefined) {
      return this.#active
    }

    debug.session.login(this.#options.accountId, 'begin')

    return this.#loginPromise = PROMISE_VOID.then(async () => {
      if (this.#error !== undefined) {
        throw this.#error
      }

      try {
        const liveSessionTokenUrl = urlJoin(this.#options.baseURL, 'v1/api/oauth/live_session_token')
        const diffieHellmanPrivateKey = generateDiffieHellmanPrivateKey()
        const diffieHellmanChallenge = generateDiffieHellmanChallenge({
          key: diffieHellmanPrivateKey,
          prime: this.#options.diffieHellmanPrime,
        })

        const authorizationHeader = generateSignedAuthorizationHeader({
          signatureMethod: 'RSA-SHA256',
          diffieHellmanChallenge,
          method: 'POST',
          url: liveSessionTokenUrl,
          accessToken: this.#options.accessToken,
          consumerKey: this.#options.consumerKey,
          realm: this.#options.realm,
          decryptedAccessTokenSecret: this.#options.decryptedAccessTokenSecret,
          privateSignatureKey: this.#options.privateSignatureKey,
        })

        debug.session.login(this.#options.accountId, 'token verification')

        const liveSessionTokenResponse = await HTTPClient.postOkJSON(liveSessionTokenUrl, {
          guard: LiveSessionTokenResponse,
          headers: {
            'Authorization': authorizationHeader,
          },
          signal: this.#controller.signal,
        })

        // HMAC_SHA1(response^key % prime, decrypted access token secret)
        const liveSessionToken = crypto.createHmac(
          'sha1',
          bigIntToBuffer(modularExponentiation(
            BigInt(`0x${liveSessionTokenResponse.diffie_hellman_response}`),
            diffieHellmanPrivateKey,
            BigInt(`0x${this.#options.diffieHellmanPrime}`),
          )),
        ).update(
          this.#options.decryptedAccessTokenSecret,
          'hex',
        ).digest(
          'base64',
        )

        const hmac = crypto.createHmac('sha1', Buffer.from(liveSessionToken, 'base64')).update(
          this.#options.consumerKey,
          'utf8',
        ).digest('hex')

        if (hmac !== liveSessionTokenResponse.live_session_token_signature) {
          debug.session.login(this.#options.accountId, 'failed - token invalid')
          throw new Error('Live session token is invalid')
        }

        const loginUrl = urlJoin(this.#options.baseURL, 'v1/api/iserver/auth/ssodh/init')
        loginUrl.searchParams.set('compete', 'true')
        loginUrl.searchParams.set('publish', 'true')

        debug.session.login(this.#options.accountId, `token valid`)

        const response = await HTTPClient.postOkJSON(loginUrl, {
          headers: {
            Authorization: generateSignedAuthorizationHeader({
              signatureMethod: 'HMAC-SHA256',
              method: 'POST',
              liveSessionToken: liveSessionToken,
              url: loginUrl,
              accessToken: this.#options.accessToken,
              consumerKey: this.#options.consumerKey,
              realm: this.#options.realm,
            }),
          },
          guard: LoginResponse,
          signal: this.#controller.signal,
        })

        if (response.authenticated === false || response.connected === false) {
          debug.session.login(this.#options.accountId, 'failed - confirmation invalid')
          throw new Error(
            `Failed to login. authenticated=${response.authenticated}, connected=${response.connected}`,
          )
        }

        debug.session.login(this.#options.accountId, 'warm-up start')
        await this.#warmUp({ liveSessionToken })

        debug.session.login(this.#options.accountId, 'warm-up completed')

        const tickle = await this.#tickle({ liveSessionToken })

        if (tickle.iserver.authStatus.authenticated !== true || tickle.iserver.authStatus.connected !== true) {
          debug.session.login(this.#options.accountId, 'failed - tickle invalid')

          throw new Error('Could not retrieve tickle session token')
        }

        this.#active = {
          liveSessionToken,
          liveSessionTokenExpiration: liveSessionTokenResponse.live_session_token_expiration,
          tickleSessionToken: tickle.session,
        }

        this.emit('live-session-token', this.#active.liveSessionToken)
        this.emit('tickle-session-token', this.#active.tickleSessionToken)

        return this.#active
      } catch (error) {
        if (error instanceof HTTPClientRequestAbortError && this.#controller.signal.aborted) {
          throw new Error(`${this.constructor.name} is disposed`)
        }

        if (this.#error === undefined) {
          this.#error = ensureError(error)
        }

        // Do NOT await dispose here, as it will cause a deadlock
        this.dispose().catch(() => {})

        throw error
      }
    }).finally(() => {
      this.#loginPromise = undefined
    })
  }

  async liveSessionToken(): Promise<string> {
    const session = await this.#ensureActiveSession()

    return session.liveSessionToken
  }

  async tickleSessionToken(): Promise<string> {
    const session = await this.#ensureActiveSession()

    return session.tickleSessionToken
  }

  /**
   * Checks if the given live session token matches the current live session token.
   *
   * @param liveSessionToken - The live session token to check.
   * @returns True if the given live session token matches the current live session token; otherwise, false.
   */
  has({ liveSessionToken }: { readonly liveSessionToken: string }): boolean {
    return this.#active?.liveSessionToken === liveSessionToken
  }

  /**
   * Resets the current live session token.
   *
   * @param liveSessionToken - Optional live session token to reset. If not provided, the current live session token will be reset.
   * @returns True if the live session token was reset successfully; otherwise, false.
   */
  async reset({ liveSessionToken }: { readonly liveSessionToken: string }): Promise<boolean> {
    debug.session.reset(this.#options.accountId)

    let match = false

    if (this.#active?.liveSessionToken === liveSessionToken) {
      this.#active = undefined
      match = true
    }

    debug.session.reset(this.#options.accountId, 'logout')
    await this.#logout({ liveSessionToken })

    return match
  }

  /**
   * Creates an authorization header for the given HTTP method and URL.
   * @param method - The HTTP method to be used (GET, POST, etc.)
   * @param url - The URL to be used for the request.
   * @param liveSessionToken - The live session token to be used for the request.
   * @returns The generated authorization header as a string.
   */
  authorizationHeader(
    {
      method,
      url,
      liveSessionToken,
    }: {
      readonly method: 'GET' | 'PATCH' | 'POST' | 'PUT' | 'DELETE'
      readonly liveSessionToken: string
      readonly url: URL | string
    },
  ): string {
    debug.session.authorizationHeader(this.#options.accountId)
    if (this.#error !== undefined) {
      throw this.#error
    }

    if (this.#controller.signal.aborted) {
      throw new Error(`${this.constructor.name} is disposed`)
    }

    return generateSignedAuthorizationHeader({
      method,
      url,
      signatureMethod: 'HMAC-SHA256',
      liveSessionToken,
      accessToken: this.#options.accessToken,
      consumerKey: this.#options.consumerKey,
      realm: this.#options.realm,
    })
  }
}

/**
 * Generates a random 256-bit integer suitable for Diffie-Hellman challanges.
 *
 * This function generates 32 random bytes, converts them to a hexadecimal string,
 * and then parses that string as a bigint.
 *
 * @returns A bigint representing a random 256-bit integer.
 */
function generateDiffieHellmanPrivateKey(): bigint {
  const randomBytes = crypto.randomBytes(32)
  const hexString = randomBytes.toString('hex')
  return BigInt('0x' + hexString)
}

/**
 * Generate the Diffie-Hellman challenge, based on the equation A = g^a mod p
 *
 * @param key A bigint representing the private key a
 * @param generator The generator g, defaults to 2
 * @returns The result of (generator ^ random) % prime, as a hex string
 */
function generateDiffieHellmanChallenge({ key, prime, generator = 2n }: {
  readonly key: bigint
  readonly prime: string
  readonly generator?: undefined | bigint
}): string {
  // Compute A = g^a mod p using native BigInt exponentiation
  const dhChallenge = modularExponentiation(generator, key, BigInt(`0x${prime}`))

  // Convert to hex (without the "0x" prefix)
  return dhChallenge.toString(16)
}

function generateSignedAuthorizationHeader(
  options:
    & {
      readonly method: 'GET' | 'PATCH' | 'POST' | 'PUT' | 'DELETE'
      readonly url: string | URL
      readonly consumerKey: string
      readonly accessToken: string
      readonly realm: string
    }
    & ({
      readonly signatureMethod: 'HMAC-SHA256' // todo consider if we can implement a better discriminated union (e.g. use a 'type' field)
      readonly liveSessionToken: string
    } | {
      readonly signatureMethod: 'RSA-SHA256'
      readonly diffieHellmanChallenge: string
      readonly decryptedAccessTokenSecret: string
      readonly privateSignatureKey: string
    }),
): string {
  const url = new URL(options.url)
  const searchParams = new URLSearchParams(url.searchParams)
  url.search = '' // remove search params from the url, since these need to be encoded in the signature separately

  const urlEscaped = escapeSignatureString(url.href)

  const nonce = BigInt(`0x${crypto.randomBytes(12).toString('hex')}`).toString(36).substring(0, 16)

  const timestamp = Math.floor(Date.now() / 1000).toString()

  // Step 1.
  // Setup initial authorization headers
  // These will all be included in the OAuth authorization header
  // These are all the required keys, besides the signature which will be added later
  const authorizationHeaders: Record<string, string> = {
    'oauth_consumer_key': options.consumerKey,
    'oauth_nonce': nonce,
    'oauth_signature_method': options.signatureMethod,
    'oauth_timestamp': timestamp,
    'oauth_token': options.accessToken,
    ...(options.signatureMethod === 'RSA-SHA256' ? { 'diffie_hellman_challenge': options.diffieHellmanChallenge } : {}),
  }

  // Step 2.
  // Setup the signature base string.
  // The base string should consist of all the authorization header values, along with the search parameters for the URL
  // It's important that the keys are sorted alphabetically
  const signatureValues = {
    ...authorizationHeaders,
    ...Object.fromEntries(searchParams.entries()),
  }

  const signatureHeadersString = escapeSignatureString(
    Object.entries(signatureValues)
      .toSorted(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}=${value}`)
      .join('&'),
  )

  // Step 3.
  // Generate the signature based on the signature method
  // The only situation for RSA-SHA256 is when we generate the live session token
  // In all other cases, we use HMAC-SHA256.
  switch (options.signatureMethod) {
    case 'HMAC-SHA256': {
      const baseString = `${options.method}&${urlEscaped}&${signatureHeadersString}`

      authorizationHeaders['oauth_signature'] = generateHMACSHA256Signature({
        baseString,
        liveSessionToken: options.liveSessionToken,
      })

      break
    }

    case 'RSA-SHA256': {
      const baseString =
        `${options.decryptedAccessTokenSecret}${options.method}&${urlEscaped}&${signatureHeadersString}`

      authorizationHeaders['oauth_signature'] = generateRSASHA256Signature({
        baseString,
        privateSignatureKey: options.privateSignatureKey,
      })

      break
    }
  }

  // Step 4.
  // We are now ready to generate the final OAuth authorization header
  // This will be based on previously generated authorization headers, along with the signature
  return `OAuth realm="${options.realm}", ${
    Object.entries(authorizationHeaders)
      .toSorted(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}="${value}"`)
      .join(', ')
  }`
}

function generateHMACSHA256Signature({
  baseString,
  liveSessionToken,
}: {
  readonly baseString: string
  readonly liveSessionToken: string
}): string {
  const key = Buffer.from(liveSessionToken, 'base64')

  const hmac = crypto.createHmac('sha256', key)
  hmac.update(baseString, 'utf8')
  const base64Signature = hmac.digest('base64')

  return escapeSignatureString(base64Signature)
}

function generateRSASHA256Signature({
  baseString,
  privateSignatureKey,
}: {
  readonly baseString: string
  readonly privateSignatureKey: string
}): string {
  const signer = crypto.createSign('RSA-SHA256').update(baseString, 'utf8').end()
  const rawSignature = signer.sign(privateSignatureKey, 'base64')
  return escapeSignatureString(rawSignature.replace(/\n/g, ''))
}

/**
 * Computes the modular exponentiation of a number.
 *
 * This function calculates "(base^exp) % mod" using the exponentiation by squaring algorithm.
 * It efficiently handles large integers without computing the full power, thus preventing potential
 * performance or memory issues.
 *
 * @param base - The base value as a bigint.
 * @param exp - The exponent as a bigint.
 * @param mod - The modulus as a bigint.
 * @returns The result of (base^exp) % mod.
 */
function modularExponentiation(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n
  let current = base % mod
  let exponent = exp

  while (exponent > 0n) {
    if ((exponent & 1n) === 1n) {
      result = (result * current) % mod
    }
    current = (current * current) % mod
    exponent >>= 1n // equivalent to dividing by 2
  }

  return result
}

/**
 * Encodes a string in a way similar to Python's urllib.parse.quote_plus.
 * Spaces are replaced with '+' instead of '%20'.
 *
 * @param input - The input string to encode.
 * @returns The URL-encoded string with spaces as plus signs.
 */
function escapeSignatureString(input: string): string {
  return encodeURIComponent(input).replace(/%20/g, '+')
}

// todo this function is AI-generated by chatgpt, based on the python implementation - review it
/**
 * Converts a BigInt to a Buffer (big-endian).
 *
 * @param num - The BigInt to convert.
 * @returns A Buffer representing the BigInt.
 */
function bigIntToBuffer(num: bigint): Buffer {
  // Convert the number to its hexadecimal representation.
  let hex = num.toString(16)

  // Ensure the hex string has an even number of characters.
  if (hex.length % 2 !== 0) {
    hex = '0' + hex
  }

  // Compute the binary representation's length.
  // This tells us how many bits are used to represent the number.
  const bitLength = num.toString(2).length

  // If the bit length is exactly divisible by 8, prepend a zero byte.
  if (bitLength % 8 === 0) {
    hex = '00' + hex
  }

  return Buffer.from(hex, 'hex')
}
