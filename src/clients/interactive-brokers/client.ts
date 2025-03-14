import { join } from 'jsr:@std/path@^1.0.8/join'
import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import { Debug } from '../../utils/debug.ts'
import { Environment } from '../../utils/environment.ts'
import { CombinedSignalController } from '../../utils/signal.ts'
import { Timeout } from '../../utils/timeout.ts'
import { urlJoin } from '../../utils/url.ts'
import {
  HTTPClient,
  HTTPClientError,
  HTTPClientRequestAbortError,
  HTTPError,
  HTTPServiceError,
} from '../http-client.ts'
import { InteractiveBrokersOAuth1a } from './client-oath1a.ts'
import { InteractiveBrokersResourceClient } from './resource-client.ts'
import { Iserver } from './resources/iserver.ts'
import { StatusResponse } from './resources/iserver/auth/status.ts'
import { Portfolio } from './resources/portfolio.ts'
import { Trsrv } from './resources/trsrv.ts'

// todo find ud af hvordan rate limit fungerer og håndter det

const debug = {
  created: Debug('ib-client:created'),
  disposed: Debug('ib-client:disposed'),
  error: Debug('ib-client:error'),
}

export interface InteractiveBrokersClientOptions {
  readonly type: 'Live' | 'Paper'
}

export class InteractiveBrokersClient<Options extends InteractiveBrokersClientOptions = InteractiveBrokersClientOptions>
  implements AsyncDisposable {
  static readonly CONFIG = {
    baseURL: new URL('https://api.ibkr.com'),
    websocketURL: new URL('wss://api.ibkr.com/v1/api/ws'),
    Live: {
      paths: {
        privateSignatureKey: join(Deno.cwd(), 'certificates', 'live_private_signature.pem'),
        privateEncryptionKey: join(Deno.cwd(), 'certificates', 'live_private_encryption.pem'),
      },

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
  } as const

  readonly #http: HTTPClient

  readonly type: Options['type']
  readonly baseURL: URL
  readonly session: InteractiveBrokersOAuth1a

  readonly iserver: Iserver
  readonly portfolio: Portfolio
  readonly trsrv: Trsrv

  constructor(options: Options) {
    const config = InteractiveBrokersClient.CONFIG[options.type]

    this.type = options.type
    this.baseURL = InteractiveBrokersClient.CONFIG.baseURL

    this.session = new InteractiveBrokersOAuth1a({
      accountId: config.accountId,
      baseURL: InteractiveBrokersClient.CONFIG.baseURL,
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

    const requestsLiveSessionTokenMap = new WeakMap<object, string>()
    const goneMap = new WeakMap<object, number>()

    this.#http = new HTTPClient({
      headers: async ({ request }) => {
        if (this.session.error !== undefined) {
          throw this.session.error
        }

        if (this.session.status === 'disposed') {
          throw new Error('InteractiveBrokersClient is disposed')
        }

        const { liveSessionToken } = await this.session.ensureActiveSession()

        requestsLiveSessionTokenMap.set(request, liveSessionToken)

        return HTTPClient.joinHeaders({
          'User-Agent': 'Systematic Trader IB Client',
          Authorization: this.session.authorizationHeader({
            method: request.method,
            url: request.url,
            liveSessionToken,
          }),
        }, request.headers)
      },
      onError: async ({ request, error, retries }) => {
        const goneCount = goneMap.get(request) ?? 0

        // IB periodically returns 410 Gone errors for requests that are still valid.
        // And since all paths are known to be valid, we can safely retry them.
        if (error instanceof HTTPClientError && error.statusCode === 410) {
          goneMap.set(request, goneCount + 1)

          const timeout = Timeout.wait(1000)

          if (request.signal === undefined) {
            await timeout
          } else {
            const listener = () => timeout.abort()

            request.signal.addEventListener('abort', listener, { once: true })

            try {
              await Timeout.wait(1000)
            } finally {
              request.signal.removeEventListener('abort', listener)
            }
          }

          return
        }

        const liveSessionToken = requestsLiveSessionTokenMap.get(request)

        if (
          // There should always be a live session token
          liveSessionToken !== undefined &&
          (
            error instanceof HTTPClientError ||
            error instanceof HTTPServiceError
          )
        ) {
          if ((retries - goneCount) === 0) {
            // Check if the live session token has already been updated
            if (this.session.has({ liveSessionToken }) === false) {
              return
            }

            const statusUrl = urlJoin(this.baseURL, 'v1/api/iserver/auth/status')

            using controller = new CombinedSignalController(this.session.signal, request.signal)

            const response = await HTTPClient.postOkJSON(statusUrl, {
              headers: {
                Authorization: this.session.authorizationHeader({
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
              await this.session.reset({ liveSessionToken })

              return
            }
          }
        }

        debug.error(config.accountId, error)

        if (error instanceof HTTPError === false && error instanceof HTTPClientRequestAbortError === false) {
          /* log unknown error begin */

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

          debug.error(config.accountId, 'Error properties', extracted)
          /* log unknown error end */
        }

        throw error
      },
    })

    const resourceClient = new InteractiveBrokersResourceClient({
      http: this.#http,
      url: urlJoin(this.baseURL, 'v1/api'),
      accountID: config.accountId,
    })

    this.iserver = new Iserver(resourceClient)
    this.portfolio = new Portfolio(resourceClient)
    this.trsrv = new Trsrv(resourceClient)
  }

  [Symbol.asyncDispose](): Promise<void> {
    return this.session.dispose()
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
