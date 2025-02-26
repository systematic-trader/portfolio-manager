import { integer, props, string } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { join } from 'jsr:@std/path@^1.0.8/join'
import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import { Environment } from '../../utils/environment.ts'
import { ensureError } from '../../utils/error.ts'
import { mergeAbortSignals } from '../../utils/signal.ts'
import { Timeout } from '../../utils/timeout.ts'
import { urlJoin } from '../../utils/url.ts'
import { HTTPClient, HTTPClientRequestAbortError } from '../http-client.ts'
import { InteractiveBrokersResourceClient } from './resource-client.ts'
import { Iserver } from './resources/iserver.ts'
import { Trsrv } from './resources/trsrv.ts'

// todo håndter scenariet, hvor vores live session token er udløbet (tjek for 401 - undersøg hvad de sender til os)

// todo find ud af hvordan rate limit fungerer og håndter det

// todo improve logging (e.g. we should show login/logout, lst generation, etc.)
// const debug = {
//   login: Debug('ib-client:login'),
// }

const LiveSessionTokenResponse = props({
  diffie_hellman_response: string(),
  live_session_token_signature: string(),
  live_session_token_expiration: integer(), // epoch time in ms
})

interface LiveSession {
  /** The live session token, which should be used in authorization-flow */
  readonly token: string

  /** The expiration of the token, epoch time in ms */
  readonly expiration: number
}

export type SearchParamValue = undefined | boolean | number | string | ReadonlyArray<number | string | boolean>

export type SearchParamRecord = Record<string, SearchParamValue>

// todo let's figure out how to handle/store these files (they shoulnd't be in the repo - even if gitignored)
const CONFIG = {
  Live: {
    paths: {
      privateSignatureKey: join(Deno.cwd(), 'certificates', 'live_private_signature.pem'),
      privateEncryptionKey: join(Deno.cwd(), 'certificates', 'live_private_encryption.pem'),
    },

    baseURL: new URL('https://api.ibkr.com'),

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

    baseURL: new URL('https://qa.interactivebrokers.com'),

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
  readonly trsrv: Trsrv

  constructor(options: Options) {
    const config = CONFIG[options.type]

    this.type = options.type
    this.baseURL = config.baseURL

    this.#session = new InteractiveBrokersOAuth1a({
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

    this.#http = new HTTPClient({
      headers: async ({ method, url, signal }) => {
        if (this.#session.error !== undefined) {
          throw this.#session.error
        }

        if (this.#session.status === 'disposed') {
          throw new Error('InteractiveBrokersClient is disposed')
        }

        const authorizationHeader = await this.#session.createAuthorizationHeader({ method, url, signal })

        return {
          'User-Agent': 'Systematic Trader IB Client',
          Authorization: authorizationHeader,
        }
      },
      onError: (error) => {
        // handle session timeout by setting this.#
        throw error
      },
    })

    const resourceClient = new InteractiveBrokersResourceClient({
      http: this.#http,
      url: urlJoin(this.baseURL, 'v1/api'),
    })

    this.iserver = new Iserver(resourceClient)
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
  #liveSessionPromise: undefined | Promise<LiveSession>
  #disposePromise: undefined | Promise<void>
  #ticklePromise: undefined | Timeout<void>

  get error(): undefined | Error {
    return this.#error
  }

  get status(): 'active' | 'disposed' {
    return this.#controller.signal.aborted ? 'disposed' : 'active'
  }

  constructor(options: {
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
    this.#liveSessionPromise = undefined
    this.#disposePromise = undefined
    this.#ticklePromise = undefined
  }

  async #login({ signal }: { readonly signal?: undefined | AbortSignal } = {}): Promise<LiveSession> {
    try {
      const mergedSignal = mergeAbortSignals(this.#controller.signal, signal)

      const url = urlJoin(this.#options.baseURL, 'v1/api/oauth/live_session_token')
      const diffieHellmanPrivateKey = this.#generateDiffieHellmanPrivateKey()
      const diffieHellmanChallenge = this.#generateDiffieHellmanChallenge({ key: diffieHellmanPrivateKey })

      const authorizationHeader = this.#generateSignedAuthorizationHeader({
        signatureMethod: 'RSA-SHA256',
        diffieHellmanChallenge,
        method: 'POST',
        url,
      })

      const liveSessionTokenResponse = await HTTPClient.postOkJSON(url, {
        guard: LiveSessionTokenResponse,
        headers: {
          'Authorization': authorizationHeader,

          // todo these might not be required
          'Accept-Encoding': 'gzip, deflate',
          'Accept': '*/*',
          'Connection': 'keep-alive',
          'Content-Length': '0',
        },
        signal: mergedSignal,
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
        throw new Error('Live session token is invalid')
      }

      // todo se hvad den returnerer og skriv en guard - fail fast hvis noget ikke er som vi forventer
      const loginUrl = urlJoin(this.#options.baseURL, 'v1/api/iserver/auth/ssodh/init')
      loginUrl.searchParams.set('compete', 'true')
      loginUrl.searchParams.set('publish', 'true')

      await HTTPClient.postOkJSON(loginUrl, {
        headers: {
          Authorization: this.#generateSignedAuthorizationHeader({
            signatureMethod: 'HMAC-SHA256',
            method: 'POST',
            liveSessionToken: liveSessionToken,
            url: loginUrl,
          }),
        },
        signal: mergedSignal,
      })

      let firstTickle = true

      this.#ticklePromise = Timeout.repeat(60 * 1000, async (signal) => {
        if (firstTickle) {
          firstTickle = false
          return
        }

        try {
          await HTTPClient.post(urlJoin(this.#options.baseURL, 'v1/api/tickle'), { signal })
        } catch (error) {
          this.dispose().catch(() => {})

          throw error
        }
      })

      return {
        token: liveSessionToken,
        expiration: liveSessionTokenResponse.live_session_token_expiration,
      }
    } catch (error) {
      this.#error = ensureError(error)
      this.#controller.abort()
      throw error
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

  /**
   * Creates an authorization header for the given HTTP method and URL.
   * @param method - The HTTP method to be used (GET, POST, etc.)
   * @param url - The URL to be used for the request.
   * @param signal - An optional AbortSignal to cancel the request.
   * @returns The generated authorization header as a string.
   */
  async createAuthorizationHeader(
    {
      method,
      url,
      signal,
    }: {
      readonly method: 'GET' | 'PATCH' | 'POST' | 'PUT' | 'DELETE'
      readonly url: URL | string
      readonly signal?: undefined | AbortSignal
    },
  ): Promise<string> {
    if (this.#error !== undefined) {
      throw this.#error
    }

    if (this.#controller.signal.aborted) {
      throw new Error('InteractiveBrokersOAuth1a is disposed')
    }

    if (this.#liveSessionPromise === undefined) {
      this.#liveSessionPromise = this.#login({ signal })
    }

    const liveSession = await this.#liveSessionPromise

    return this.#generateSignedAuthorizationHeader({
      method,
      url,
      signatureMethod: 'HMAC-SHA256',
      liveSessionToken: liveSession.token,
    })
  }

  async [Symbol.asyncDispose](): Promise<void> {
    if (this.#disposePromise !== undefined) {
      return this.#disposePromise
    }

    if (this.#error !== undefined) {
      throw this.#error
    }

    if (this.#controller.signal.aborted) {
      return
    }

    this.#controller.abort()
    this.#ticklePromise?.abort()

    this.#disposePromise = Promise.allSettled([this.#liveSessionPromise, this.#ticklePromise]).then(
      async ([sessionResult, tickleResult]) => {
        if (sessionResult.status === 'fulfilled' && sessionResult.value !== undefined) {
          const logoutUrl = urlJoin(this.#options.baseURL, 'v1/api/logout')

          // todo skriv en guard og se hvad den returnerer
          await HTTPClient.postOkJSON(logoutUrl, {
            headers: {
              Authorization: this.#generateSignedAuthorizationHeader({
                method: 'POST',
                url: logoutUrl,
                signatureMethod: 'HMAC-SHA256',
                liveSessionToken: sessionResult.value.token,
              }),
            },
            timeout: 10_000,
          })
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

      throw this.#error
    }).finally(() => {
      this.#liveSessionPromise = undefined
      this.#ticklePromise = undefined
      this.#disposePromise = undefined
    })

    return await this.#disposePromise
  }

  dispose(): Promise<void> {
    return this[Symbol.asyncDispose]()
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
