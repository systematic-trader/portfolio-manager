import {
  boolean,
  type GuardType,
  integer,
  optional,
  props,
  string,
  unknown,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { join } from 'jsr:@std/path@^1.0.8/join'
import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import { Debug } from '../../utils/debug.ts'
import { Environment } from '../../utils/environment.ts'
import { ensureError } from '../../utils/error.ts'
import { CombinedSignalController } from '../../utils/signal.ts'
import { Timeout } from '../../utils/timeout.ts'
import { urlJoin } from '../../utils/url.ts'
import { HTTPClient, HTTPClientRequestAbortError, HTTPError, HTTPServiceError } from '../http-client.ts'
import { InteractiveBrokersResourceClient } from './resource-client.ts'
import { Iserver } from './resources/iserver.ts'
import { StatusResponse } from './resources/iserver/auth/status.ts'
import { Portfolio } from './resources/portfolio.ts'
import { Trsrv } from './resources/trsrv.ts'
import { SuppressibleMessageIdValues } from './types/record/suppressible-message-ids.ts'

const PROMISE_VOID = Promise.resolve()

// todo håndter scenariet, hvor vores live session token er udløbet (tjek for 401 - undersøg hvad de sender til os)

// todo find ud af hvordan rate limit fungerer og håndter det

// todo improve logging (e.g. we should show login/logout, lst generation, etc.)
const debug = {
  created: Debug('ib-client:created'),
  disposed: Debug('ib-client:disposed'),
  error: Debug('ib-client:error'),
  session: {
    authorizationHeader: Debug('ib-client:session:authorization-header'),
    authorize: Debug('ib-client:session:authorize'),
    reset: Debug('ib-client:session:reset'),
    dispose: Debug('ib-client:session:dispose'),
    tickle: Debug('ib-client:session:tickle'),
    error: Debug('ib-client:session:error'),
  },
  warmUp: {
    accounts: Debug('ib-client:warm-up:accounts'),
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
  serverInfo: unknown(),
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

// todo let's figure out how to handle/store these files (they shoulnd't be in the repo - even if gitignored)
const CONFIG = {
  Live: {
    paths: {
      privateSignatureKey: join(Deno.cwd(), 'certificates', 'live_private_signature.pem'),
      privateEncryptionKey: join(Deno.cwd(), 'certificates', 'live_private_encryption.pem'),
    },

    baseURL: new URL('https://api.ibkr.com'),

    get accountId() {
      return Environment.get('IB_LIVE_ACCOUNT_ID')
    },
    get consumerKey() {
      return Environment.get('IB_LIVE_CONSUMER_KEY')
    },
    get accessToken() {
      return Environment.get('IB_LIVE_ACCESS_TOKEN')
    },
    get accessTokenSecret() {
      return Environment.get('IB_LIVE_ACCESS_TOKEN_SECRET')
    },
    get diffieHellmanPrime() {
      return Environment.get('IB_LIVE_DIFFIE_HELLMAN_PRIME')
    },
  },
  Paper: {
    paths: {
      privateSignatureKey: join(Deno.cwd(), 'certificates', 'paper_private_signature.pem'),
      privateEncryptionKey: join(Deno.cwd(), 'certificates', 'paper_private_encryption.pem'),
    },

    baseURL: new URL('https://api.ibkr.com'),

    get accountId() {
      return Environment.get('IB_PAPER_ACCOUNT_ID')
    },
    get consumerKey() {
      return Environment.get('IB_PAPER_CONSUMER_KEY')
    },
    get accessToken() {
      return Environment.get('IB_PAPER_ACCESS_TOKEN')
    },
    get accessTokenSecret() {
      return Environment.get('IB_PAPER_ACCESS_TOKEN_SECRET')
    },
    get diffieHellmanPrime() {
      return Environment.get('IB_PAPER_DIFFIE_HELLMAN_PRIME')
    },
  },
}

export interface InteractiveBrokersClientOptions {
  readonly type: 'Live' | 'Paper'
}

export class InteractiveBrokersClient<Options extends InteractiveBrokersClientOptions> implements AsyncDisposable {
  readonly #session: InteractiveBrokersOAuth1a
  readonly #http: HTTPClient

  readonly type: Options['type']
  readonly baseURL: URL

  readonly iserver: Iserver
  readonly portfolio: Portfolio
  readonly trsrv: Trsrv

  constructor(options: Options) {
    const config = CONFIG[options.type]

    this.type = options.type
    this.baseURL = config.baseURL

    this.#session = new InteractiveBrokersOAuth1a({
      accountId: config.accountId,
      baseURL: config.baseURL,
      consumerKey: config.consumerKey,
      accessToken: config.accessToken,
      accessTokenSecret: config.accessTokenSecret,
      diffieHellmanPrime: config.diffieHellmanPrime,
      realm: config.consumerKey === 'TESTCONS' ? 'test_realm' : 'limited_poa',
      decryptedAccessTokenSecret: decryptAccessTokenSecret({
        accessTokenSecret: config.accessTokenSecret,
        privateEncryptionKey: Deno.readTextFileSync(config.paths.privateEncryptionKey),
      }),
      privateSignatureKey: Deno.readTextFileSync(config.paths.privateSignatureKey),
    })

    const requestsMap = new WeakMap<object, string>()

    this.#http = new HTTPClient({
      headers: async ({ request }) => {
        if (this.#session.error !== undefined) {
          throw this.#session.error
        }

        if (this.#session.status === 'disposed') {
          throw new Error('InteractiveBrokersClient is disposed')
        }

        // 20250228-21:05 8V1j/Yzlty5KhqyUl0zz2bfOw3s=
        const liveSessionToken = await this.#session.authorize()

        requestsMap.set(request, liveSessionToken)

        return HTTPClient.joinHeaders({
          'User-Agent': 'Systematic Trader IB Client',
          Authorization: this.#session.authorizationHeader({
            method: request.method,
            url: request.url,
            liveSessionToken,
          }),
        }, request.headers)
      },
      onError: async ({ request, error, retries }) => {
        const liveSessionToken = requestsMap.get(request)

        if (
          // There should always be a live session token
          liveSessionToken !== undefined &&
          (
            error instanceof HTTPClient ||
            error instanceof HTTPServiceError
          )
        ) {
          if (retries === 0) {
            // Check if the live session token has already been updated
            if (this.#session.has({ liveSessionToken }) === false) {
              return
            }

            const statusUrl = urlJoin(config.baseURL, 'v1/api/iserver/auth/status')

            using controller = new CombinedSignalController(this.#session.signal, request.signal)

            const response = await HTTPClient.postOkJSON(statusUrl, {
              headers: {
                Authorization: this.#session.authorizationHeader({
                  method: 'POST',
                  url: statusUrl,
                  liveSessionToken,
                }),
              },
              signal: controller.signal,
              guard: StatusResponse,
            }).catch(() => undefined)

            // Check if a new live session token is required
            if ((response?.authenticated !== true && response?.connected !== true)) {
              // Check if other requests are already updating the live session token
              await this.#session.reset({ liveSessionToken })

              return
            }
          }
        } else if (error instanceof HTTPError === false && error instanceof HTTPClientRequestAbortError === false) {
          /* log unknown error begin */
          debug.error(config.accountId, 'UNKNOWN', error)

          const extracted = {} as Record<string, unknown>

          for (const key in error) {
            if (key !== 'stack') {
              Reflect.set(extracted, key, Reflect.get(error, key))
            }
          }

          for (const key of Reflect.ownKeys(error)) {
            if (key !== 'stack') {
              Reflect.set(extracted, key, Reflect.get(error, key))
            }
          }

          debug.error(config.accountId, 'UNKNOWN', 'properties', extracted)
          /* log unknown error end */
        }

        throw error
      },
    })

    const resourceClient = new InteractiveBrokersResourceClient({
      http: this.#http,
      url: urlJoin(this.baseURL, 'v1/api'),
    })

    this.iserver = new Iserver(resourceClient)
    this.portfolio = new Portfolio(resourceClient)
    this.trsrv = new Trsrv(resourceClient)
  }

  [Symbol.asyncDispose](): Promise<void> {
    return this.#session.dispose()
  }

  dispose(): Promise<void> {
    return this[Symbol.asyncDispose]()
  }
}

/**
 * Decrypts the access token secret using the private encryption key loaded from the given path.
 * The result is converted to a hexadecimal string and returned as the prepend used when requesting the live session token.
 *
 * @param accessTokenSecret - Base64 encoded access token secret.
 * @param privateEncryptionKey - The pem-formatted private encryption key.
 * @returns The hex string result of the decrypted access token secret.
 */
function decryptAccessTokenSecret({ accessTokenSecret, privateEncryptionKey }: {
  readonly accessTokenSecret: string
  readonly privateEncryptionKey: string
}): string {
  // Decode the accessTokenSecret from base64 into a Buffer.
  const encryptedBuffer = Buffer.from(accessTokenSecret, 'base64')

  // Decrypt the buffer using RSA private decryption with PKCS#1 v1.5 padding.
  // Note: crypto.privateDecrypt uses RSA_PKCS1_PADDING by default.
  const decryptedBuffer = crypto.privateDecrypt(
    {
      key: privateEncryptionKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    encryptedBuffer,
  )

  // Convert the decrypted result to a hexadecimal string and return it.
  return Buffer.from(decryptedBuffer).toString('hex')
}

class InteractiveBrokersOAuth1a implements AsyncDisposable {
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
  #liveSessionTokenPromise: undefined | Promise<string>
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

  #liveSessionToken: undefined | string = undefined

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
    this.#options = options
    this.#controller = new AbortController()
    this.#error = undefined
    this.#liveSessionTokenPromise = undefined
    this.#disposePromise = undefined

    this.#ticklePromise = Timeout.repeat(60 * 1000, async (signal) => {
      using controller = new CombinedSignalController(this.#controller.signal, signal)

      if (
        controller.signal.aborted ||
        this.#liveSessionToken === undefined ||
        this.#liveSessionTokenPromise !== undefined // new live session token is being generated
      ) {
        return
      }

      debug.session.tickle(this.#options.accountId, 'token check')

      try {
        const response = await this.#tickle({ liveSessionToken: this.#liveSessionToken, signal: controller.signal })

        if (
          response.iserver.authStatus.authenticated !== true &&
          response.iserver.authStatus.connected !== true
        ) {
          debug.session.tickle(this.#options.accountId, 'token invalid')

          this.#liveSessionToken = undefined
        } else {
          debug.session.tickle(this.#options.accountId, 'token valid')
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

  async #warmUp({ liveSessionToken }: { readonly liveSessionToken: string }): Promise<void> {
    const accountsURL = urlJoin(this.#options.baseURL, 'v1/api/iserver/accounts')

    // Silly (but required) warm-up specified by IBKR
    while (true) {
      const response = await HTTPClient.getOkJSON(accountsURL, {
        headers: {
          Authorization: this.#generateSignedAuthorizationHeader({
            signatureMethod: 'HMAC-SHA256',
            method: 'GET',
            liveSessionToken: liveSessionToken,
            url: accountsURL,
          }),
        },
        signal: this.#controller.signal,
      })

      if (typeof response === 'object' && response !== null && 'accounts' in response) {
        debug.warmUp.accounts(response)
        break
      }

      await Timeout.wait(1000)
    }

    // Suppress any order confirmational questions from IBKR.
    // If these messages are not suppressed at startup,
    // additional confirmation requests will add unacceptable latency to order execution.
    // Note: IBKR does not persist these suppressions between sessions
    const suppressQuestionsURL = urlJoin(this.#options.baseURL, 'v1/api/iserver/questions/suppress')
    const suppressQuestionsResponse = await HTTPClient.postOkJSON(suppressQuestionsURL, {
      headers: {
        Authorization: this.#generateSignedAuthorizationHeader({
          signatureMethod: 'HMAC-SHA256',
          method: 'POST',
          liveSessionToken: liveSessionToken,
          url: suppressQuestionsURL,
        }),
      },
      body: JSON.stringify({
        messageIds: SuppressibleMessageIdValues,
      }),
      signal: this.#controller.signal,
    })

    if (
      typeof suppressQuestionsResponse !== 'object' ||
      suppressQuestionsResponse === null ||
      ('status' in suppressQuestionsResponse && suppressQuestionsResponse.status === 'submitted') === false
    ) {
      throw new Error('Could not suppress confirmational questions')
    }

    // TODO more warm-up
  }

  async #tickle(
    { liveSessionToken, signal }: { readonly liveSessionToken: string; readonly signal?: undefined | AbortSignal },
  ): Promise<TickleResponse> {
    const tickleUrl = urlJoin(this.#options.baseURL, 'v1/api/tickle')

    const response = await HTTPClient.postOkJSON(tickleUrl, {
      headers: {
        Authorization: this.#generateSignedAuthorizationHeader({
          signatureMethod: 'HMAC-SHA256',
          method: 'POST',
          liveSessionToken,
          url: tickleUrl,
        }),
      },
      guard: TickleResponse,
      signal,
    })

    return response
  }

  /**
   * Generates a random 256-bit integer suitable for Diffie-Hellman challanges.
   *
   * This function generates 32 random bytes, converts them to a hexadecimal string,
   * and then parses that string as a bigint.
   *
   * @returns A bigint representing a random 256-bit integer.
   */
  #generateDiffieHellmanPrivateKey(): bigint {
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
  #generateDiffieHellmanChallenge({ key, generator = 2n }: {
    readonly key: bigint
    readonly generator?: undefined | bigint
  }): string {
    // Compute A = g^a mod p using native BigInt exponentiation
    const dhChallenge = modularExponentiation(generator, key, BigInt(`0x${this.#options.diffieHellmanPrime}`))

    // Convert to hex (without the "0x" prefix)
    return dhChallenge.toString(16)
  }

  #generateSignedAuthorizationHeader(
    options:
      & {
        readonly method: 'GET' | 'PATCH' | 'POST' | 'PUT' | 'DELETE'
        readonly url: string | URL
      }
      & ({
        readonly signatureMethod: 'HMAC-SHA256' // todo consider if we can implement a better discriminated union (e.g. use a 'type' field)
        readonly liveSessionToken: string
      } | {
        readonly signatureMethod: 'RSA-SHA256'
        readonly diffieHellmanChallenge: string
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
      'oauth_consumer_key': this.#options.consumerKey,
      'oauth_nonce': nonce,
      'oauth_signature_method': options.signatureMethod,
      'oauth_timestamp': timestamp,
      'oauth_token': this.#options.accessToken,
      ...(options.signatureMethod === 'RSA-SHA256'
        ? { 'diffie_hellman_challenge': options.diffieHellmanChallenge }
        : {}),
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
          `${this.#options.decryptedAccessTokenSecret}${options.method}&${urlEscaped}&${signatureHeadersString}`

        authorizationHeaders['oauth_signature'] = generateRSASHA256Signature({
          baseString,
          privateSignatureKey: this.#options.privateSignatureKey,
        })

        break
      }
    }

    // Step 4.
    // We are now ready to generate the final OAuth authorization header
    // This will be based on previously generated authorization headers, along with the signature
    return `OAuth realm="${this.#options.realm}", ${
      Object.entries(authorizationHeaders)
        .toSorted(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => `${key}="${value}"`)
        .join(', ')
    }`
  }

  /**
   * Calculates the live session token using the DH prime, private key, challange response, and prepend.
   * The live session token is used to sign requests for protected resources.
   *
   * @param diffieHellmanResponse - Hex string representing the Diffie-Hellman response.
   * @param decryptedAccessTokenSecret - Hex string (access token secret) used to derive the HMAC message.
   * @returns The live session token as a base64-encoded string.
   */
  #calculateLiveSessionToken(
    { diffieHellmanPrivateKey, diffieHellmanResponse }: {
      readonly diffieHellmanPrivateKey: bigint
      readonly diffieHellmanResponse: string
    },
  ): string {
    const a = diffieHellmanPrivateKey
    const p = BigInt(`0x${this.#options.diffieHellmanPrime}`)
    const B = BigInt(`0x${diffieHellmanResponse}`)

    // Compute K = B^a % p
    const K = modularExponentiation(B, a, p)

    // HMAC_SHA1(K, decrypted access token secret)
    return crypto.createHmac('sha1', bigIntToBuffer(K)).update(this.#options.decryptedAccessTokenSecret, 'hex').digest(
      'base64',
    )
  }

  /**
   * Validates the calculated live session token against the live session token signature.
   *
   * This function creates an HMAC using SHA1 where:
   * - The key is the result of base64-decoding the live session token.
   * - The message is the consumer key encoded in UTF-8.
   *
   * It then compares the hexadecimal digest to the provided signature.
   *
   * @param liveSessionToken - Base64 encoded live session token.
   * @param liveSessionTokenSignature - Expected HMAC signature in hexadecimal.
   * @returns True if the computed HMAC matches the signature, indicating that the live session token is valid; otherwise, false.
   */
  #validateLiveSessionToken({ liveSessionToken, liveSessionTokenSignature }: {
    readonly liveSessionToken: string
    readonly liveSessionTokenSignature: string
  }): boolean {
    const key = Buffer.from(liveSessionToken, 'base64')
    const hmac = crypto.createHmac('sha1', key).update(this.#options.consumerKey, 'utf8').digest('hex')
    return hmac === liveSessionTokenSignature
  }

  async #logout({ liveSessionToken }: { readonly liveSessionToken: string }): Promise<boolean> {
    const logoutUrl = urlJoin(this.#options.baseURL, 'v1/api/logout')

    const response = await HTTPClient.postOkJSON(logoutUrl, {
      headers: {
        Authorization: this.#generateSignedAuthorizationHeader({
          method: 'POST',
          url: logoutUrl,
          signatureMethod: 'HMAC-SHA256',
          liveSessionToken: liveSessionToken,
        }),
      },
      guard: props({ status: boolean() }, { extendable: true }),
    })

    return response.status
  }

  [Symbol.asyncDispose](): Promise<void> {
    if (this.#disposePromise !== undefined) {
      return this.#disposePromise
    }

    if (this.#controller.signal.aborted) {
      return PROMISE_VOID
    }

    this.#controller.abort()
    this.#ticklePromise.abort()

    const liveSessionTokenPromise = this.#liveSessionTokenPromise

    this.#liveSessionTokenPromise = undefined

    return this.#disposePromise = Promise.allSettled([liveSessionTokenPromise, this.#ticklePromise]).then(
      async ([sessionResult, tickleResult]) => {
        if (sessionResult.status === 'fulfilled') {
          debug.session.dispose(this.#options.accountId, 'logout')
          const liveSessionToken = sessionResult.value ?? this.#liveSessionToken
          if (liveSessionToken !== undefined) {
            await this.#logout({ liveSessionToken })
          }
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
      this.#liveSessionTokenPromise = undefined
      this.#liveSessionToken = undefined
      this.#disposePromise = undefined
    })
  }

  /**
   * Disposes the instance.
   */
  dispose(): Promise<void> {
    return this[Symbol.asyncDispose]()
  }

  /**
   * Checks if the given live session token matches the current live session token.
   *
   * @param liveSessionToken - The live session token to check.
   * @returns True if the given live session token matches the current live session token; otherwise, false.
   */
  has({ liveSessionToken }: { readonly liveSessionToken: string }): boolean {
    return this.#liveSessionToken === liveSessionToken
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

    if (this.#liveSessionToken === liveSessionToken) {
      this.#liveSessionToken = undefined
      match = true
    }

    debug.session.reset(this.#options.accountId, 'logout')
    await this.#logout({ liveSessionToken: 'abc' })

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

    return this.#generateSignedAuthorizationHeader({
      method,
      url,
      signatureMethod: 'HMAC-SHA256',
      liveSessionToken,
    })
  }

  /**
   * Authorizes and retrieves a live session token if one is not already available.
   *
   * @returns The live session token as a string.
   */
  // deno-lint-ignore require-await
  async authorize(): Promise<string> {
    if (this.#liveSessionTokenPromise !== undefined) {
      return this.#liveSessionTokenPromise
    }

    if (this.#controller.signal.aborted) {
      throw new Error(`${this.constructor.name} is disposed`)
    }

    if (this.#error !== undefined) {
      throw this.#error
    }

    if (this.#liveSessionToken !== undefined) {
      return this.#liveSessionToken
    }

    debug.session.authorize(this.#options.accountId)

    return this.#liveSessionTokenPromise = PROMISE_VOID.then(async () => {
      if (this.#error !== undefined) {
        throw this.#error
      }

      try {
        const liveSessionTokenUrl = urlJoin(this.#options.baseURL, 'v1/api/oauth/live_session_token')
        const diffieHellmanPrivateKey = this.#generateDiffieHellmanPrivateKey()
        const diffieHellmanChallenge = this.#generateDiffieHellmanChallenge({ key: diffieHellmanPrivateKey })

        const authorizationHeader = this.#generateSignedAuthorizationHeader({
          signatureMethod: 'RSA-SHA256',
          diffieHellmanChallenge,
          method: 'POST',
          url: liveSessionTokenUrl,
        })

        debug.session.authorize(this.#options.accountId, 'token verification')

        const liveSessionTokenResponse = await HTTPClient.postOkJSON(liveSessionTokenUrl, {
          guard: LiveSessionTokenResponse,
          headers: {
            'Authorization': authorizationHeader,
          },
          signal: this.#controller.signal,
        })

        const liveSessionToken = this.#calculateLiveSessionToken({
          diffieHellmanPrivateKey: diffieHellmanPrivateKey,
          diffieHellmanResponse: liveSessionTokenResponse.diffie_hellman_response,
        })

        const isValid = this.#validateLiveSessionToken({
          liveSessionToken,
          liveSessionTokenSignature: liveSessionTokenResponse.live_session_token_signature,
        })

        if (isValid === false) {
          debug.session.authorize(this.#options.accountId, 'token invalid')
          throw new Error('Live session token is invalid')
        }

        // todo se hvad den returnerer og skriv en guard - fail fast hvis noget ikke er som vi forventer
        const loginUrl = urlJoin(this.#options.baseURL, 'v1/api/iserver/auth/ssodh/init')
        loginUrl.searchParams.set('compete', 'true')
        loginUrl.searchParams.set('publish', 'true')

        debug.session.authorize(this.#options.accountId, 'login')

        const response = await HTTPClient.postOkJSON(loginUrl, {
          headers: {
            Authorization: this.#generateSignedAuthorizationHeader({
              signatureMethod: 'HMAC-SHA256',
              method: 'POST',
              liveSessionToken: liveSessionToken,
              url: loginUrl,
            }),
          },
          guard: LoginResponse,
          signal: this.#controller.signal,
        })

        if (response.authenticated === false || response.connected === false) {
          debug.session.authorize(this.#options.accountId, 'login failed')
          throw new Error(
            `Failed to login. authenticated=${response.authenticated}, connected=${response.connected}`,
          )
        }

        debug.session.authorize(this.#options.accountId, 'warm-up')
        await this.#warmUp({ liveSessionToken })

        this.#liveSessionToken = liveSessionToken

        return liveSessionToken
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
      this.#liveSessionTokenPromise = undefined
    })
  }
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
