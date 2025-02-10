import {
  type Guard,
  integer,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { join } from 'jsr:@std/path@^1.0.8/join'
import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import { Debug } from '../../utils/debug.ts'
import { Environment } from '../../utils/environment.ts'
import { ensureError } from '../../utils/error.ts'
import type { JSONReadonlyRecord } from '../../utils/json.ts'
import { mergeAbortSignals } from '../../utils/signal.ts'
import { Timeout } from '../../utils/timeout.ts'
import { HTTPClient, HTTPClientRequestAbortError } from '../http-client.ts'

// todo håndter scenariet, hvor vores live session token er udløbet (tjek for 401 - undersøg hvad de sender til os)

// todo find ud af hvordan rate limit fungerer og håndter det

// todo improve logging (e.g. we should show login/logout, lst generation, etc.)
const debug = {
  get: Debug('interactive-brokers-client:get'),
  post: Debug('interactive-brokers-client:post'),
  delete: Debug('interactive-brokers-client:delete'),
}

const LiveSessionTokenResponse = props({
  diffie_hellman_response: string(),
  live_session_token_signature: string(),
  live_session_token_expiration: integer(), // epoch time in ms
})

interface LiveSessionToken {
  /** The live session token, which should be used in authorization-flow */
  readonly token: string

  /** The expiration of the token, epoch time in ms */
  readonly expiration: number
}

export type SearchParamValue = undefined | boolean | number | string | ReadonlyArray<number | string | boolean>

export type SearchParamRecord = Record<string, SearchParamValue>

// todo let's figure out how to handle/store these files (they shoulnd't be in the repo - even if gitignored)
const PRIVATE_SIGNATURE_KEY_PATH = join(Deno.cwd(), 'private_signature.pem')
const PRIVATE_ENCRYPTION_KEY_PATH = join(Deno.cwd(), 'private_encryption.pem')

export interface InteractiveBrokersClientOptions {
  readonly type: 'Live' | 'Paper'
}

export class InteractiveBrokersClient<Options extends InteractiveBrokersClientOptions> implements AsyncDisposable {
  readonly #controller: AbortController

  readonly #env: {
    readonly baseUrl: string
    readonly consumerKey: string
    readonly accessToken: string
    readonly accessTokenSecret: string
    readonly diffieHellmanPrime: string
    readonly realm: string
  }

  readonly #http: HTTPClient

  #error: undefined | Error
  #disposePromise: undefined | Promise<void>
  #ticklePromise: undefined | Timeout<void>
  #liveSessionTokenPromise: undefined | Promise<{ readonly expiration: number; readonly token: string }>

  readonly type: Options['type']

  constructor(options: Options) {
    this.type = options.type

    const consumerKey = Environment['IB_CONSUMER_KEY']
    const accessToken = Environment['IB_ACCESS_TOKEN']
    const accessTokenSecret = Environment['IB_ACCESS_TOKEN_SECRET']
    const diffieHellmanPrime = Environment['IB_DIFFIE_HELLMAN_PRIME']

    if (consumerKey === undefined) {
      throw new Error('Environment variable IB_CONSUMER_KEY is not set')
    }

    if (accessToken === undefined) {
      throw new Error('Environment variable IB_ACCESS_TOKEN is not set')
    }

    if (accessTokenSecret === undefined) {
      throw new Error('Environment variable IB_ACCESS_TOKEN_SECRET is not set')
    }

    if (diffieHellmanPrime === undefined) {
      throw new Error('Environment variable IB_DIFFIE_HELLMAN_PRIME is not set')
    }

    this.#env = {
      baseUrl: options.type === 'Live' ? 'https://api.ibkr.com' : 'https://qa.interactivebrokers.com',
      consumerKey,
      accessToken,
      accessTokenSecret,
      diffieHellmanPrime,
      realm: consumerKey === 'TESTCONS' ? 'test_realm' : 'limited_poa',
    }

    this.#controller = new AbortController()
    this.#disposePromise = undefined

    this.#http = new HTTPClient({
      headers: {
        'User-Agent': 'Systematic Trader IB Client',
      },
    })
  }

  async #startAndMaintainSession({ signal }: {
    readonly signal: AbortSignal
  }): Promise<LiveSessionToken> {
    try {
      this.#ticklePromise?.abort()
      await this.#ticklePromise

      const liveSessionToken = await this.#createLiveSessionToken({ signal })

      // todo se hvad den returnerer og skriv en guard - fail fast hvis noget ikke er som vi forventer
      const loginUrl = new URL('v1/api/iserver/auth/ssodh/init', this.#env.baseUrl)
      loginUrl.searchParams.set('compete', 'true')
      loginUrl.searchParams.set('publish', 'true')

      await this.#http.postOkJSON(loginUrl, {
        headers: {
          Authorization: generateSignedAuthorizationHeader({
            signatureMethod: 'HMAC-SHA256',
            accessToken: this.#env.accessToken,
            consumerKey: this.#env.consumerKey,
            httpMethod: 'POST',
            liveSessionToken: liveSessionToken.token,
            realm: this.#env.realm,
            url: loginUrl,
          }),
        },
        signal,
      })

      let firstTickle = true

      this.#ticklePromise = Timeout.repeat(55 * 1000, async () => {
        if (firstTickle) {
          firstTickle = false
          return
        }

        try {
          await this.#tickle({ signal })
        } catch (error) {
          if (this.#error !== undefined) {
            this.#error = ensureError(error)
          }

          this.dispose().catch(() => {})
        }
      })

      return liveSessionToken
    } catch (error) {
      if (this.#error !== undefined) {
        this.#error = ensureError(error)
      }

      throw error
    }
  }

  async #tickle({ signal }: {
    readonly signal: AbortSignal
  }): Promise<void> {
    await this.post({
      path: 'v1/api/tickle',
      signal,
    }).catch((error) => {
      if (error instanceof HTTPClientRequestAbortError) {
        return
      }

      throw error
    })
  }

  async [Symbol.asyncDispose](): Promise<void> {
    if (this.#disposePromise !== undefined) {
      return this.#disposePromise
    }

    if (this.#controller.signal.aborted) {
      if (this.#error !== undefined) {
        throw this.#error
      }
      return
    }

    this.#controller.abort()

    this.#ticklePromise?.abort()

    this.#disposePromise = Promise.resolve().then(async () => {
      if (this.#liveSessionTokenPromise === undefined) {
        return
      }

      await this.#ticklePromise?.catch(() => {})

      try {
        const liveSessionToken = await this.#liveSessionTokenPromise

        const logoutUrl = new URL('v1/api/logout', this.#env.baseUrl)

        // todo skriv en guard og se hvad den returnerer
        await this.#http.postOkJSON(logoutUrl, {
          headers: {
            Authorization: generateSignedAuthorizationHeader({
              signatureMethod: 'HMAC-SHA256',
              accessToken: this.#env.accessToken,
              consumerKey: this.#env.consumerKey,
              httpMethod: 'POST',
              liveSessionToken: liveSessionToken.token,
              realm: this.#env.realm,
              url: logoutUrl,
            }),
          },
          timeout: 10_000,
        })
      } catch (error) {
        if (error instanceof HTTPClientRequestAbortError) {
          return
        }

        if (this.#error === undefined) {
          this.#error = ensureError(error)
        }

        throw error
      }
    }).finally(() => {
      this.#disposePromise = undefined
    })

    return await this.#disposePromise
  }

  dispose(): Promise<void> {
    return this[Symbol.asyncDispose]()
  }

  #httpMethodPrecheck(): void {
    if (this.#error !== undefined) {
      throw this.#error
    }

    if (this.#controller.signal.aborted) {
      throw new Error('InteractiveBrokersClient is disposed')
    }
  }

  // todo skriv en generisk fetch (GET, PUT, PATCH, POST, DELETE), som laver switch og bruger http client
  async get<T = unknown>({
    guard,
    headers,
    path = '',
    searchParams,
    signal,
  }: {
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  }): Promise<unknown> {
    this.#httpMethodPrecheck()

    const url = new URL(path, this.#env.baseUrl)
    if (searchParams !== undefined) {
      url.search = buildURLSearchParams(searchParams).toString()
    }

    let liveSessionToken: undefined | LiveSessionToken = undefined

    const mergedSignal = mergeAbortSignals(this.#controller.signal, signal)!

    if (this.#liveSessionTokenPromise === undefined) {
      this.#liveSessionTokenPromise = this.#startAndMaintainSession({ signal: mergedSignal })
      liveSessionToken = await this.#liveSessionTokenPromise
    } else {
      try {
        liveSessionToken = await this.#liveSessionTokenPromise
      } catch (error) {
        if (error instanceof HTTPClientRequestAbortError) {
          return this.get({ guard, headers, path, searchParams, signal })
        }

        throw error
      }
    }

    const authorizationHeader = generateSignedAuthorizationHeader({
      signatureMethod: 'HMAC-SHA256',
      accessToken: this.#env.accessToken,
      consumerKey: this.#env.consumerKey,
      httpMethod: 'GET',
      liveSessionToken: liveSessionToken.token,
      realm: this.#env.realm,
      url,
    })

    debug.get(url.toString())

    return this.#http.getOkJSON(url, {
      headers: {
        ...headers,
        Authorization: authorizationHeader,
      },
      guard,
      signal: mergedSignal,
    })
  }

  async post<T = unknown>({
    body,
    guard,
    headers,
    path = '',
    searchParams,
    signal,
  }: {
    readonly body?: JSONReadonlyRecord
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  }): Promise<unknown> {
    this.#httpMethodPrecheck()

    const url = new URL(path, this.#env.baseUrl)
    if (searchParams !== undefined) {
      url.search = buildURLSearchParams(searchParams).toString()
    }

    let liveSessionToken: undefined | LiveSessionToken = undefined

    const mergedSignal = mergeAbortSignals(this.#controller.signal, signal)!

    if (this.#liveSessionTokenPromise === undefined) {
      this.#liveSessionTokenPromise = this.#startAndMaintainSession({ signal: mergedSignal })
      liveSessionToken = await this.#liveSessionTokenPromise
    } else {
      try {
        liveSessionToken = await this.#liveSessionTokenPromise
      } catch (error) {
        if (error instanceof HTTPClientRequestAbortError) {
          return this.get({ guard, headers, path, searchParams, signal })
        }

        throw error
      }
    }

    const authorizationHeader = generateSignedAuthorizationHeader({
      signatureMethod: 'HMAC-SHA256',
      accessToken: this.#env.accessToken,
      consumerKey: this.#env.consumerKey,
      httpMethod: 'POST',
      liveSessionToken: liveSessionToken.token,
      realm: this.#env.realm,
      url,
    })

    debug.post(url.toString())

    return this.#http.postOkJSON(url, {
      headers: {
        ...headers,
        Authorization: authorizationHeader,
      },
      guard,
      body: JSON.stringify(body),
      signal: mergedSignal,
    })
  }

  async delete<T = unknown>({
    guard,
    headers,
    path = '',
    searchParams,
    signal,
  }: {
    readonly body?: JSONReadonlyRecord
    readonly guard?: undefined | Guard<T>
    readonly headers?: undefined | Record<string, string>
    readonly path?: undefined | string
    readonly searchParams?: undefined | SearchParamRecord
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  }): Promise<unknown> {
    this.#httpMethodPrecheck()

    const url = new URL(path, this.#env.baseUrl)
    if (searchParams !== undefined) {
      url.search = buildURLSearchParams(searchParams).toString()
    }

    let liveSessionToken: undefined | LiveSessionToken = undefined

    const mergedSignal = mergeAbortSignals(this.#controller.signal, signal)!

    if (this.#liveSessionTokenPromise === undefined) {
      this.#liveSessionTokenPromise = this.#startAndMaintainSession({ signal: mergedSignal })
      liveSessionToken = await this.#liveSessionTokenPromise
    } else {
      try {
        liveSessionToken = await this.#liveSessionTokenPromise
      } catch (error) {
        if (error instanceof HTTPClientRequestAbortError) {
          return this.get({ guard, headers, path, searchParams, signal })
        }

        throw error
      }
    }

    const authorizationHeader = generateSignedAuthorizationHeader({
      signatureMethod: 'HMAC-SHA256',
      accessToken: this.#env.accessToken,
      consumerKey: this.#env.consumerKey,
      httpMethod: 'DELETE',
      liveSessionToken: liveSessionToken.token,
      realm: this.#env.realm,
      url,
    })

    debug.delete(url.toString())

    return this.#http.deleteOkJSON(url, {
      headers: {
        ...headers,
        Authorization: authorizationHeader,
      },
      guard,
      signal: mergedSignal,
    })
  }

  async #createLiveSessionToken({ signal }: {
    readonly signal: AbortSignal
  }): Promise<{
    readonly token: string
    readonly expiration: number
  }> {
    const url = new URL('v1/api/oauth/live_session_token', this.#env.baseUrl)

    const diffieHellmanPrivateKey = generateDiffieHellmanPrivateKey()

    const diffieHellmanChallenge = generateDiffieHellmanChallenge({
      prime: this.#env.diffieHellmanPrime,
      key: diffieHellmanPrivateKey,
    })

    const decryptedAccessTokenSecret = decryptAccessTokenSecret({
      accessTokenSecret: this.#env.accessTokenSecret,
      privateEncryptionKey: await Deno.readTextFile(PRIVATE_ENCRYPTION_KEY_PATH), // todo move this somewhere else (we don't need to read from disk every time)
    })

    const authorizationHeader = generateSignedAuthorizationHeader({
      signatureMethod: 'RSA-SHA256',
      accessToken: this.#env.accessToken,
      consumerKey: this.#env.consumerKey,
      decryptedAccessTokenSecret,
      diffieHellmanChallenge,
      httpMethod: 'POST',
      privateSignatureKey: await Deno.readTextFile(PRIVATE_SIGNATURE_KEY_PATH), // todo move this somewhere else (we don't need to read from disk every time)
      realm: this.#env.realm,
      url,
    })

    const liveSessionTokenResponse = await this.#http.postOkJSON(url, {
      guard: LiveSessionTokenResponse,
      headers: {
        'Authorization': authorizationHeader,

        // todo these might not be required
        'Accept-Encoding': 'gzip, deflate',
        'Accept': '*/*',
        'Connection': 'keep-alive',
        'Content-Length': '0',
      },
      signal,
    })

    const liveSessionToken = calculateLiveSessionToken({
      diffieHellmanPrime: this.#env.diffieHellmanPrime,
      decryptedAccessTokenSecret,
      diffieHellmanPrivateKey: diffieHellmanPrivateKey,
      diffieHellmanResponse: liveSessionTokenResponse.diffie_hellman_response,
    })

    const isValid = validateLiveSessionToken(
      liveSessionToken,
      liveSessionTokenResponse.live_session_token_signature,
      this.#env.consumerKey,
    )

    if (isValid === false) {
      throw new Error('Live session token is invalid')
    }

    return {
      token: liveSessionToken,
      expiration: liveSessionTokenResponse.live_session_token_expiration,
    }
  }
}

function generateSignedAuthorizationHeader(
  options:
    & {
      readonly httpMethod: 'GET' | 'POST' | 'DELETE'
      readonly realm: string
      readonly url: URL | string
      readonly consumerKey: string
      readonly accessToken: string
    }
    & ({
      readonly signatureMethod: 'HMAC-SHA256' // todo consider if we can implement a better discriminated union (e.g. use a 'type' field)
      readonly liveSessionToken: string
    } | {
      readonly signatureMethod: 'RSA-SHA256'
      readonly diffieHellmanChallenge: string
      readonly privateSignatureKey: string
      readonly decryptedAccessTokenSecret: string
    }),
): string {
  const urlClone = new URL(options.url.toString())
  const searchParams = new URLSearchParams(urlClone.searchParams)
  urlClone.search = '' // remove search params from the url, since these need to be encoded in the signature separately

  const urlEscaped = escapeSignatureString(urlClone.toString())

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
      const baseString = `${options.httpMethod}&${urlEscaped}&${signatureHeadersString}`

      authorizationHeaders['oauth_signature'] = generateHMACSHA256Signature({
        baseString,
        liveSessionToken: options.liveSessionToken,
      })

      break
    }

    case 'RSA-SHA256': {
      const baseString =
        `${options.decryptedAccessTokenSecret}${options.httpMethod}&${urlEscaped}&${signatureHeadersString}`

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
 * Generate the Diffie-Hellman challenge, based on the equation A = g^a mod p
 *
 * @param prime A hex string representing the prime p
 * @param key A bigint representing the private key a
 * @param generator The generator g, defaults to 2
 * @returns The result of (generator ^ random) % prime, as a hex string
 */
function generateDiffieHellmanChallenge({ prime, key, generator = 2n }: {
  readonly prime: string
  readonly key: bigint
  readonly generator?: undefined | bigint
}): string {
  // Compute A = g^a mod p using native BigInt exponentiation
  const dhChallenge = modularExponentiation(generator, key, BigInt(`0x${prime}`))

  // Convert to hex (without the "0x" prefix)
  return dhChallenge.toString(16)
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
 * @param consumerKey - The consumer key (UTF-8 string) used as the HMAC message.
 * @returns True if the computed HMAC matches the signature, indicating that the live session token is valid; otherwise, false.
 */
export function validateLiveSessionToken(
  liveSessionToken: string,
  liveSessionTokenSignature: string,
  consumerKey: string,
): boolean {
  const key = Buffer.from(liveSessionToken, 'base64')
  const hmac = crypto.createHmac('sha1', key).update(consumerKey, 'utf8').digest('hex')
  return hmac === liveSessionTokenSignature
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

/**
 * Calculates the live session token using the DH prime, private key, challange response, and prepend.
 * The live session token is used to sign requests for protected resources.
 *
 * @param diffieHellmanPrime - Hex string representing the Diffie-Hellman prime.
 * @param diffieHellmanPrivateKey - The Diffie-Hellman random exponent.
 * @param diffieHellmanResponse - Hex string representing the Diffie-Hellman response.
 * @param decryptedAccessTokenSecret - Hex string (access token secret) used to derive the HMAC message.
 * @returns The live session token as a base64-encoded string.
 */
export function calculateLiveSessionToken(
  { decryptedAccessTokenSecret, diffieHellmanPrime, diffieHellmanPrivateKey, diffieHellmanResponse }: {
    readonly decryptedAccessTokenSecret: string
    readonly diffieHellmanPrime: string
    readonly diffieHellmanPrivateKey: bigint
    readonly diffieHellmanResponse: string
  },
): string {
  const a = diffieHellmanPrivateKey
  const p = BigInt(`0x${diffieHellmanPrime}`)
  const B = BigInt(`0x${diffieHellmanResponse}`)

  // Compute K = B^a % p
  const K = modularExponentiation(B, a, p)

  // HMAC_SHA1(K, private key)
  return crypto.createHmac('sha1', bigIntToBuffer(K)).update(decryptedAccessTokenSecret, 'hex').digest('base64')
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

function buildURLSearchParams(params: SearchParamRecord): URLSearchParams {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue
    }

    if (Array.isArray(value)) {
      searchParams.set(key, value.join(','))
    }

    searchParams.set(key, value.toString())
  }

  return searchParams
}
