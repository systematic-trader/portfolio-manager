import { join } from 'jsr:@std/path@^1.0.8/join'
import crypto from 'node:crypto'
import { Environment } from '../../utils/environment.ts'
import { ensureError } from '../../utils/error.ts'
import { Timeout } from '../../utils/timeout.ts'
import { HTTPClient } from '../http-client.ts'

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
      baseUrl: options.type === 'Live' ? 'https://api.ibkr.com/v1/api' : 'https://qa.interactivebrokers.com',
      consumerKey,
      accessToken,
      accessTokenSecret,
      diffieHellmanPrime,
      realm: consumerKey === 'TESTCONS' ? 'test_realm' : 'limited_poa',
    }

    this.#controller = new AbortController()
    this.#disposePromise = undefined

    this.#http = new HTTPClient({
      headers: async () => {
        if (this.#liveSessionTokenPromise === undefined) {
          this.#liveSessionTokenPromise = this.#getLiveSessionToken()
        }

        const liveSessionToken = await this.#liveSessionTokenPromise

        return {
          Authorization: `Bearer ${liveSessionToken.token}`,
        }
      },
    })
  }

  async #getLiveSessionToken(): Promise<{
    /**  UTC timestamp in milliseconds when the token expires.*/
    readonly expiration: number
    readonly token: string
  }> {
    try {
      this.#ticklePromise?.abort()

      await this.#ticklePromise

      // login here and create a new live session token

      this.#ticklePromise = Timeout.repeat(50 * 1000, async () => {
        try {
          await this.#tickle()
        } catch (error) {
          if (this.#error !== undefined) {
            this.#error = ensureError(error)
          }

          this.dispose().catch(() => {})
        }
      })

      throw new Error('Not implemented')
    } catch (error) {
      if (this.#error !== undefined) {
        this.#error = ensureError(error)
      }

      throw error
    }
  }

  async #logout(): Promise<void> {
    throw new Error('Not implemented')
  }

  async #tickle(): Promise<void> {
    throw new Error('Not implemented')
  }

  async [Symbol.asyncDispose](): Promise<void> {
    if (this.#disposePromise !== undefined) {
      return this.#disposePromise
    }

    if (this.#controller.signal.aborted) {
      return
    }

    this.#controller.abort()

    this.#ticklePromise?.abort()

    this.#disposePromise = Promise.resolve().then(async () => {
      if (this.#liveSessionTokenPromise === undefined) {
        return
      }

      await Promise.allSettled([this.#liveSessionTokenPromise, this.#ticklePromise])

      await this.#logout()
    }).finally(() => {
      this.#disposePromise = undefined
    })

    return await this.#disposePromise
  }

  dispose(): Promise<void> {
    return this[Symbol.asyncDispose]()
  }

  get(): unknown {
    if (this.#error !== undefined) {
      throw this.#error
    }

    if (this.#controller.signal.aborted) {
      throw new Error('InteractiveBrokersClient is disposed')
    }

    throw new Error('Not implemented')
  }

  post(): unknown {
    if (this.#error !== undefined) {
      throw this.#error
    }

    if (this.#controller.signal.aborted) {
      throw new Error('InteractiveBrokersClient is disposed')
    }

    throw new Error('Not implemented')
  }

  delete(): unknown {
    if (this.#error !== undefined) {
      throw this.#error
    }

    if (this.#controller.signal.aborted) {
      throw new Error('InteractiveBrokersClient is disposed')
    }

    throw new Error('Not implemented')
  }
}

/**
 * Generates a random hexadecimal string suitable for Diffie-Hellman operations.
 *
 * This function uses Node's crypto module to generate 32 random bytes and returns them as a
 * 64-character hexadecimal string.
 *
 * @returns A 64-character hex string representing 32 random bytes.
 */
function generateDiffieHellmanRandom(): string {
  return crypto.randomBytes(32).toString('hex')
}
