import type { GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { toArray } from '../../../utils/async-iterable.ts'
import { ensureError } from '../../../utils/error.ts'
import { Timeout } from '../../../utils/timeout.ts'
import { HTTPClientRequestAbortError } from '../../http-client.ts'
import { SaxoBankApplication } from '../../saxobank-application.ts'
import { SaxoBankStream } from '../../saxobank-stream.ts'
import type { SaxoBankSubscription } from '../stream/saxobank-subscription.ts'
import type {
  InfoPriceSubscriptionOptions,
  SaxoBankSubscriptionInfoPriceMessage,
} from '../stream/subscriptions/saxobank-subscription-info-price.ts'
import type { Currency3 } from '../types/derives/currency.ts'
import type { AccountResponse } from '../types/records/account-response.ts'
import type { ClientResponse } from '../types/records/client-response.ts'
import type { PriceResponse } from '../types/records/price-response.ts'

type PriceResponse = { [K in keyof typeof PriceResponse]: GuardType<typeof PriceResponse[K]> }

export interface DataContextBalance {
  readonly currency: Currency3
  readonly cash: number
  readonly marginAvailable: number
  readonly marginUsed: number
  readonly marginTotal: number
  readonly marginUtilization: number
  readonly positionsUnrealized: number
  readonly total: number
}

export class DataContextError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class DataContext implements AsyncDisposable {
  readonly app: SaxoBankApplication
  readonly #controller: AbortController
  readonly #initializers = new Map<string, Promise<DataContextReader<unknown>>>()
  readonly #subscriptionReaders = new Map<string, DataContextReader<unknown>>()
  readonly #appReaders = new Map<string, DataContextReader<unknown>>()
  readonly #stream1: SaxoBankStream
  readonly #stream2: SaxoBankStream
  readonly #stream3: SaxoBankStream
  readonly #stream4: SaxoBankStream

  #disposePromise: undefined | Promise<void>
  #error: undefined | Error

  get #availableStream(): SaxoBankStream {
    if (this.#stream1.size < 200) {
      return this.#stream1
    }

    if (this.#stream2.size < 200) {
      return this.#stream2
    }

    if (this.#stream3.size < 200) {
      return this.#stream3
    }

    if (this.#stream4.size < 200) {
      return this.#stream4
    }

    throw new Error('No available stream')
  }

  constructor({ type }: {
    /** Type of the application. */
    readonly type?: undefined | SaxoBankApplication['type']
  }) {
    this.app = new SaxoBankApplication({ type })
    this.#controller = new AbortController()
    this.#stream1 = new SaxoBankStream({ app: this.app, signal: this.#controller.signal })
    this.#stream2 = new SaxoBankStream({ app: this.app, signal: this.#controller.signal })
    this.#stream3 = new SaxoBankStream({ app: this.app, signal: this.#controller.signal })
    this.#stream4 = new SaxoBankStream({ app: this.app, signal: this.#controller.signal })

    const streamDispose = () => {
      // Do NOT return the promise here, as it will cause a deadlock
      this[Symbol.asyncDispose]()
    }

    this.#stream1.addListener('disposed', streamDispose)
    this.#stream2.addListener('disposed', streamDispose)
    this.#stream3.addListener('disposed', streamDispose)
    this.#stream4.addListener('disposed', streamDispose)

    this.#disposePromise = undefined
    this.#error = undefined
  }

  async [Symbol.asyncDispose](): Promise<void> {
    if (this.#disposePromise !== undefined) {
      return this.#disposePromise
    }

    if (this.#controller.signal.aborted) {
      return
    }

    this.#controller.abort()

    const { promise, reject, resolve } = Promise.withResolvers<void>()

    this.#disposePromise = promise

    Promise.allSettled(this.#initializers.values()).then(() => {
      return Promise.allSettled([
        this.#stream1.dispose(),
        this.#stream2.dispose(),
        this.#stream3.dispose(),
        this.#stream4.dispose(),
        ...this.#appReaders.values().map((reader) => reader.dispose()),
      ]).then((results) => {
        try {
          this.app.dispose()
        } catch (error) {
          if (this.#error === undefined) {
            this.#error = ensureError(error)
          }

          return reject(this.#error)
        }

        for (const result of results) {
          if (result.status === 'rejected') {
            if (this.#error === undefined) {
              this.#error = ensureError(result.reason)
            }
          }
        }

        if (this.#error === undefined) {
          if (this.#stream1?.state.status === 'failed') {
            this.#error = this.#stream1.state.error
          } else if (this.#stream2?.state.status === 'failed') {
            this.#error = this.#stream2.state.error
          } else if (this.#stream3?.state.status === 'failed') {
            this.#error = this.#stream3.state.error
          } else if (this.#stream4?.state.status === 'failed') {
            this.#error = this.#stream4.state.error
          }
        }

        if (this.#error !== undefined) {
          return reject(this.#error)
        }

        resolve()
      }).finally(() => {
        this.#disposePromise = undefined
      })
    })

    await promise
  }

  dispose(): Promise<void> {
    return this[Symbol.asyncDispose]()
  }

  refresh(): void {
    if (this.#error !== undefined) {
      throw this.#error
    }

    if (this.#controller.signal.aborted) {
      return
    }

    for (const reader of this.#subscriptionReaders.values()) {
      reader.refresh()
    }
  }

  #createSubscriptionReader<T, U>(
    { key, create, map }: {
      readonly key: string
      readonly create: () => Promise<SaxoBankSubscription<T>>
      readonly map: (value: T) => U
    },
  ): Promise<DataContextReader<U>> {
    if (this.#error !== undefined) {
      throw this.#error
    }

    if (this.#controller.signal.aborted) {
      throw new DataContextError('DataContext is disposed')
    }

    const reader = this.#subscriptionReaders.get(key)

    if (reader !== undefined) {
      return Promise.resolve(reader as DataContextReader<U>)
    }

    let initializer = this.#initializers.get(key)

    if (initializer !== undefined) {
      return initializer as Promise<DataContextReader<U>>
    }

    initializer = create().then((subscription) => {
      let value = map(subscription.message)

      const reader = new DataContextReader({
        dispose: async (): Promise<void> => {
          const value = this.#subscriptionReaders.get(key)

          if (value === reader) {
            this.#subscriptionReaders.delete(key)
          }

          if (subscription.status === 'active') {
            await subscription.dispose()
          }

          if (this.#error !== undefined) {
            throw this.#error
          }
        },
        read: () => {
          if (this.#error !== undefined) {
            throw this.#error
          }

          return value
        },
        refresh: () => {
          if (this.#error !== undefined) {
            throw this.#error
          }

          if (this.#controller.signal.aborted) {
            return
          }

          value = map(subscription.message)
        },
      })

      subscription.addListener('disposed', reader.dispose)

      this.#subscriptionReaders.set(key, reader)

      return reader
    }).finally(() => {
      this.#initializers.delete(key)
    })

    this.#initializers.set(key, initializer)

    return initializer as Promise<DataContextReader<U>>
  }

  #createAppReader<T, U>(
    { key, wait, read, map }: {
      readonly key: string
      readonly wait: number
      readonly read: (signal?: undefined | AbortSignal) => Promise<T>
      readonly map: (value: T) => U
    },
  ): Promise<DataContextReader<U>> {
    if (this.#error !== undefined) {
      throw this.#error
    }

    if (this.#controller.signal.aborted) {
      throw new DataContextError('DataContext is disposed')
    }

    const reader = this.#appReaders.get(key)

    if (reader !== undefined) {
      return Promise.resolve(reader as DataContextReader<U>)
    }

    let initializer = this.#initializers.get(key)

    if (initializer !== undefined) {
      return initializer as Promise<DataContextReader<U>>
    }

    initializer = read(this.#controller.signal).then((response) => {
      let value = response

      let first = true

      const repeater = Timeout.repeat(wait, async (signal) => {
        if (first) {
          first = false
          return
        }

        try {
          value = await read(signal)
        } catch (error) {
          if (error instanceof HTTPClientRequestAbortError === false && this.#error === undefined) {
            this.#error = ensureError(error)
          }

          repeater.abort()
        }
      })

      let readerValue = map(value)

      const reader = new DataContextReader({
        dispose: async () => {
          repeater.abort()

          await repeater
        },
        read: () => {
          if (this.#error !== undefined) {
            throw this.#error
          }

          return readerValue
        },
        refresh: () => {
          if (this.#error !== undefined) {
            throw this.#error
          }

          if (this.#controller.signal.aborted) {
            return
          }

          readerValue = map(value)
        },
      })

      this.#appReaders.set(key, reader)

      return reader
    }).finally(() => {
      this.#initializers.delete(key)
    })

    this.#initializers.set(key, initializer)

    return initializer as Promise<DataContextReader<U>>
  }

  async balance(
    { clientKey, accountKey }: { readonly clientKey: string; readonly accountKey?: undefined | string },
  ): Promise<DataContextReader<DataContextBalance>> {
    return await this.#createSubscriptionReader({
      key: 'balance-' + (accountKey === undefined ? clientKey : `${clientKey}:${accountKey}`),
      create: () => this.#availableStream.balance({ ClientKey: clientKey, AccountKey: accountKey }),
      map: (message) => {
        const {
          Currency,
          CashBalance,
          MarginAvailableForTrading,
          MarginUsedByCurrentPositions,
          MarginUtilizationPct,
          UnrealizedPositionsValue,
          TotalValue,
        } = message

        if (MarginAvailableForTrading === undefined) {
          throw new Error('MarginAvailableForTrading is undefined')
        }

        if (MarginUsedByCurrentPositions === undefined) {
          throw new Error('MarginUsedByCurrentPositions is undefined')
        }

        if (MarginUtilizationPct === undefined) {
          throw new Error('MarginUtilizationPct is undefined')
        }

        return {
          currency: Currency,
          cash: CashBalance,
          marginAvailable: MarginAvailableForTrading,
          marginUsed: MarginUsedByCurrentPositions,
          marginTotal: MarginAvailableForTrading + MarginUsedByCurrentPositions,
          marginUtilization: MarginUtilizationPct / 100,
          positionsUnrealized: UnrealizedPositionsValue,
          total: TotalValue,
        }
      },
    })
  }

  async price<AssetType extends keyof PriceResponse>(
    { assetType, uic }: { readonly assetType: AssetType; readonly uic: number },
  ): Promise<DataContextReader<PriceResponse[AssetType]>> {
    return await this.#createSubscriptionReader({
      key: `price-${assetType}:${uic}`,
      create: () =>
        this.#availableStream.price({ AssetType: assetType, Uic: uic }) as unknown as Promise<
          SaxoBankSubscription<
            PriceResponse[AssetType]
          >
        >,
      map: (message) => message,
    })
  }

  async infoPrice<AssetType extends keyof InfoPriceSubscriptionOptions>(
    { assetType, uic }: { readonly assetType: AssetType; readonly uic: number },
  ): Promise<DataContextReader<SaxoBankSubscriptionInfoPriceMessage>> {
    return await this.#createSubscriptionReader({
      key: `info-price-${assetType}:${uic}`,
      create: () =>
        this.#availableStream.infoPrice(
          { AssetType: assetType, Uic: uic } as unknown as InfoPriceSubscriptionOptions[AssetType],
        ),
      map: (message) => message,
    })
  }

  async client(): Promise<
    DataContextReader<ClientResponse>
  > {
    return await this.#createAppReader({
      key: 'client-me',
      wait: 10 * 60 * 1000, // 10 minutes
      read: (signal) => this.app.portfolio.clients.me({ signal }),
      map: (response) => response,
      // map: (response) => {
      //   return {
      //     clientKey: response.ClientKey,
      //     name: response.Name,
      //     nettingProfile: response.PositionNettingProfile,
      //     protectionLimit: response.AccountValueProtectionLimit ?? 0,
      //   }
      // },
    })
  }

  async accounts(
    { clientKey }: { readonly clientKey: string },
  ): Promise<DataContextReader<readonly AccountResponse[]>> {
    return await this.#createAppReader({
      key: 'accounts-' + clientKey,
      wait: 9 * 60 * 1000, // 9 minutes
      read: (signal) =>
        toArray(this.app.portfolio.accounts.get({ ClientKey: clientKey, IncludeSubAccounts: true }, { signal })),
      map: (accounts) => {
        return accounts
          .filter((account) =>
            account.Active === true &&
            account.AccountSubType === 'None' &&
            account.AccountType === 'Normal'
          )
      },
    })
  }

  /** instruments */
  search(): void {
    throw new Error('Not implemented')
  }

  add({ uics }: { readonly uics: readonly number[] }): Promise<void> {
    throw new Error('Not implemented')
  }

  get({}: { assetType: string; uic: number }): unknown /* instrument */ {
    throw new Error('Not implemented')
  }

  has({}: { assetType: string; uic: number }): boolean {
    throw new Error('Not implemented')
  }

  tryGet({}: { assetType: string; uic: number }): unknown /* instrument */ {
    throw new Error('Not implemented')
  }
}

export class DataContextReader<T> {
  readonly #dispose: () => Promise<void>
  readonly #read: () => T
  readonly #refresh: () => void

  get value(): T {
    return this.#read()
  }

  constructor({ dispose, read, refresh }: { dispose(): Promise<void>; read(): T; refresh(): void }) {
    this.#read = read

    this.#dispose = dispose
    this.#refresh = refresh
  }

  async dispose(): Promise<void> {
    await this.#dispose()
  }

  refresh(): void {
    this.#refresh()
  }

  view<U>(map: (value: T) => U): DataContextReaderView<U> {
    let value = this.#read()
    let mapped = map(value)

    return new DataContextReaderView({
      read: () => {
        if (value !== this.#read()) {
          value = this.#read()
          mapped = map(value)
        }

        return mapped
      },
    })
  }
}

export class DataContextReaderView<T> {
  readonly #read: () => T

  get value(): T {
    return this.#read()
  }

  constructor({ read }: { read(): T }) {
    this.#read = read
  }

  view<U>(map: (value: T) => U): DataContextReaderView<U> {
    let value = this.#read()
    let mapped = map(value)

    return new DataContextReaderView({
      read: () => {
        if (value !== this.#read()) {
          value = this.#read()
          mapped = map(value)
        }

        return mapped
      },
    })
  }
}
