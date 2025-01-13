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
import type { BalanceResponse } from '../types/records/balance-response.ts'
import type { ClientResponse } from '../types/records/client-response.ts'
import type { ClosedPositionResponseUnion } from '../types/records/closed-position-response.ts'
import type { InfoPriceRequest } from '../types/records/info-price-request.ts'
import type { InstrumentDetails, InstrumentDetailsUnion } from '../types/records/instrument-details.ts'
import type { InstrumentSummaryInfoType } from '../types/records/instrument-summary-info.ts'
import type { OrderResponseUnion } from '../types/records/order-response.ts'
import type { PositionResponseUnion } from '../types/records/position-response.ts'
import type { PriceResponse } from '../types/records/price-response.ts'
import {
  SaxoBankAccountBalancePropertyUndefinedError,
  SaxoBankAccountCurrencyMismatchError,
  SaxoBankAccountNotFoundError,
  SaxoBankBrokerOptionsError,
  SaxoBankClientBalancePropertyUndefinedError,
  SaxoBankDefaultCurrencyMismatchError,
  SaxoBankInstrumentNotFoundError,
  SaxoBankInstrumentSymbolAssetTypeMismatchError,
  SaxoBankInstrumentSymbolNotFoundError,
  SaxoBankInstrumentSymbolsNotFoundError,
  SaxoBankInstrumentUICAssetTypeMismatchError,
  SaxoBankInstrumentUICNotFoundError,
  SaxoBankInstrumentUICNotTradableError,
} from './errors.ts'
import { mapInstrumentSessions, type MarketSession } from './market-session.ts'

type PriceResponse = { [K in keyof typeof PriceResponse]: GuardType<typeof PriceResponse[K]> }

export interface DataContextBalance {
  readonly cash: number
  readonly marginAvailable: number
  readonly marginUsed: number
  readonly marginTotal: number
  readonly marginUtilization: number
  readonly positionsUnrealized: number
  readonly total: number
}

export interface DataContextQuoteSnapshot {
  /** Updated at timestamp. */
  readonly updatedAt: string
  /** The ask price and size of the stock. */
  readonly ask: {
    /** The ask price of the stock. */
    readonly price: number
    /** The ask size of the stock. */
    readonly size: number
  }
  /** The bid price and size of the stock. */
  readonly bid: {
    /** The bid price of the stock. */
    readonly price: number
    /** The bid size of the stock. */
    readonly size: number
  }
  /** Mid price calculated as (ask.amount + bid.amount) / 2. */
  readonly midPrice: number
}

export interface DataContextStock {
  readonly symbol: string
  readonly description: string
  readonly lot: {
    readonly minimum: number
    readonly maximum: undefined | number
    readonly increment: number
  }
  readonly sum: {
    readonly minimum: undefined | number
    readonly maximum: undefined | number
  }
  readonly session: MarketSession
  roundPriceToTickSize(price: number): number
}

export interface DataContextClient {
  readonly key: string
  readonly currency: Currency3
  readonly balance: DataContextBalance
}

export interface DataContextAccount {
  readonly ID: string
  readonly key: string
  readonly currency: Currency3
  readonly balance: DataContextBalance
}

function mapClientBalance(value: BalanceResponse): DataContextBalance {
  if (value.MarginAvailableForTrading === undefined) {
    throw new SaxoBankClientBalancePropertyUndefinedError('MarginAvailableForTrading')
  }

  if (value.MarginUsedByCurrentPositions === undefined) {
    throw new SaxoBankClientBalancePropertyUndefinedError('MarginUsedByCurrentPositions')
  }

  if (value.MarginUtilizationPct === undefined) {
    throw new SaxoBankClientBalancePropertyUndefinedError('MarginUtilizationPct')
  }

  return {
    cash: value.CashBalance,
    marginAvailable: value.MarginAvailableForTrading,
    marginUsed: value.MarginUsedByCurrentPositions,
    marginTotal: value.MarginAvailableForTrading + value.MarginUsedByCurrentPositions,
    marginUtilization: value.MarginUtilizationPct / 100,
    positionsUnrealized: value.UnrealizedPositionsValue,
    total: value.TotalValue,
  }
}

function mapAccountBalance(accountID: string, value: BalanceResponse): DataContextBalance {
  if (value.MarginAvailableForTrading === undefined) {
    throw new SaxoBankAccountBalancePropertyUndefinedError(accountID, 'MarginAvailableForTrading')
  }

  if (value.MarginUsedByCurrentPositions === undefined) {
    throw new SaxoBankAccountBalancePropertyUndefinedError(accountID, 'MarginUsedByCurrentPositions')
  }

  if (value.MarginUtilizationPct === undefined) {
    throw new SaxoBankAccountBalancePropertyUndefinedError(accountID, 'MarginUtilizationPct')
  }

  return {
    cash: value.CashBalance,
    marginAvailable: value.MarginAvailableForTrading,
    marginUsed: value.MarginUsedByCurrentPositions,
    marginTotal: value.MarginAvailableForTrading + value.MarginUsedByCurrentPositions,
    marginUtilization: value.MarginUtilizationPct / 100,
    positionsUnrealized: value.UnrealizedPositionsValue,
    total: value.TotalValue,
  }
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

    const disposeListener = this[Symbol.asyncDispose].bind(this)

    this.#stream1.addListener('disposed', disposeListener)
    this.#stream2.addListener('disposed', disposeListener)
    this.#stream3.addListener('disposed', disposeListener)
    this.#stream4.addListener('disposed', disposeListener)

    this.#error = undefined
  }

  async [Symbol.asyncDispose](): Promise<void> {
    if (this.#controller.signal.aborted) {
      if (this.#error !== undefined) {
        throw this.#error
      }

      return
    }

    this.#controller.abort()

    await Promise.allSettled(this.#initializers.values()).then(() => {
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
          throw this.#error
        }
      })
    })
  }

  dispose(): Promise<void> {
    return this[Symbol.asyncDispose]()
  }

  async refresh(): Promise<void> {
    if (this.#error !== undefined) {
      throw this.#error
    }

    if (this.#controller.signal.aborted) {
      return
    }

    const refreshPromises: Promise<void>[] = []

    for (const reader of this.#subscriptionReaders.values()) {
      refreshPromises.push(reader.refresh())
    }

    for (const reader of this.#appReaders.values()) {
      refreshPromises.push(reader.refresh())
    }

    await Promise.allSettled(refreshPromises).then((results) => {
      for (const result of results) {
        if (result.status === 'rejected') {
          if (this.#error === undefined) {
            this.#error = ensureError(result.reason)
          }
        }
      }

      if (this.#error !== undefined) {
        throw this.#error
      }
    })
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
          if (this.#subscriptionReaders.delete(key)) {
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
        // deno-lint-ignore require-await
        refresh: async () => {
          if (this.#error !== undefined) {
            throw this.#error
          }

          if (this.#controller.signal.aborted) {
            return
          }

          try {
            value = map(subscription.message)
          } catch (error) {
            if (this.#error === undefined) {
              this.#error = ensureError(error)
            }

            this[Symbol.asyncDispose]().catch(() => {})

            throw error
          }
        },
      })

      subscription.addListener('disposed', reader.dispose)

      this.#subscriptionReaders.set(key, reader)

      return reader
    }).catch(async (error) => {
      if (this.#error === undefined) {
        this.#error = ensureError(error)
      }

      await this[Symbol.asyncDispose]().catch(() => {})

      throw error
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
          if (this.#appReaders.delete(key)) {
            repeater.abort()

            await repeater
          }
        },
        read: () => {
          if (this.#error !== undefined) {
            throw this.#error
          }

          return readerValue
        },
        refresh: async () => {
          if (this.#error !== undefined) {
            throw this.#error
          }

          if (this.#controller.signal.aborted) {
            return
          }

          try {
            readerValue = map(value)
          } catch (error) {
            if (this.#error === undefined) {
              this.#error = ensureError(error)
            }

            await this[Symbol.asyncDispose]().catch(() => {})

            throw error
          }
        },
      })

      this.#appReaders.set(key, reader)

      return reader
    }).catch(async (error) => {
      if (this.#error === undefined) {
        this.#error = ensureError(error)
      }

      await this[Symbol.asyncDispose]().catch(() => {})

      throw error
    }).finally(() => {
      this.#initializers.delete(key)
    })

    this.#initializers.set(key, initializer)

    return initializer as Promise<DataContextReader<U>>
  }

  async #client(): Promise<DataContextReader<ClientResponse>> {
    return await this.#createAppReader({
      key: 'client-me',
      wait: 2 * 60 * 1000, // 2 minutes
      read: (signal) => this.app.portfolio.clients.me({ signal }),
      map: (value) => {
        if (value.PositionNettingProfile !== 'FifoRealTime') {
          throw new SaxoBankBrokerOptionsError('Position Netting must be Real-time FIFO')
        }

        if (value.AccountValueProtectionLimit !== undefined && value.AccountValueProtectionLimit > 0) {
          throw new SaxoBankBrokerOptionsError('Account Value Protection Limit must be 0')
        }

        return value
      },
    })
  }

  async #accounts(
    { clientKey }: { readonly clientKey: string },
  ): Promise<DataContextReader<readonly AccountResponse[]>> {
    return await this.#createAppReader({
      key: 'accounts-' + clientKey,
      wait: 2 * 60 * 1000, // 2 minutes
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

  async #balance(
    { clientKey, accountKey }: { readonly clientKey: string; readonly accountKey?: undefined | string },
  ): Promise<DataContextReader<BalanceResponse>> {
    return await this.#createSubscriptionReader({
      key: 'balance-' + (accountKey === undefined ? clientKey : `${clientKey}:${accountKey}`),
      create: () => this.#availableStream.balance({ ClientKey: clientKey, AccountKey: accountKey }),
      map: (message) => {
        if (message.MarginAvailableForTrading === undefined) {
          throw new Error(`Account "${accountKey}" - balance.MarginAvailableForTrading is undefined`)
        }

        if (message.MarginUsedByCurrentPositions === undefined) {
          throw new Error(`Account "${accountKey}" - balance.MarginUsedByCurrentPositions is undefined`)
        }

        if (message.MarginUtilizationPct === undefined) {
          throw new Error(`Account "${accountKey}" - balance.MarginUtilizationPct is undefined`)
        }

        return message
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

  async orders(): Promise<DataContextReader<readonly OrderResponseUnion[]>> {
    return await this.#client().then(async (clientReader) => {
      const clientKey = clientReader.value.ClientKey

      return await this.#createSubscriptionReader({
        key: `orders-${clientKey}`,
        create: () =>
          this.#availableStream.orders({
            ClientKey: clientKey,
          }),
        map: (message) => message,
      })
    })
  }

  async positions(): Promise<DataContextReader<readonly PositionResponseUnion[]>> {
    return await this.#client().then(async (clientReader) => {
      const clientKey = clientReader.value.ClientKey

      return await this.#createSubscriptionReader({
        key: `positions-${clientKey}`,
        create: () =>
          this.#availableStream.positions({
            ClientKey: clientKey,
          }),
        map: (message) => message,
      })
    })
  }

  async closedPositions(): Promise<DataContextReader<readonly ClosedPositionResponseUnion[]>> {
    return await this.#client().then(async (clientReader) => {
      const clientKey = clientReader.value.ClientKey

      return await this.#createSubscriptionReader({
        key: `closed-positions-${clientKey}`,
        create: () =>
          this.#availableStream.closedPositions({
            ClientKey: clientKey,
          }),
        map: (message) => message,
      })
    })
  }

  client({ currency }: { readonly currency: Currency3 }): Promise<DataContextReader<DataContextClient>> {
    type ReaderPromise = ReturnType<DataContext['client']>
    type Reader = Awaited<ReaderPromise>

    const key = 'client'

    const reader = this.#appReaders.get(key)

    if (reader !== undefined) {
      return Promise.resolve(reader as Reader)
    }

    let initializer = this.#initializers.get(key)

    if (initializer !== undefined) {
      return initializer as ReaderPromise
    }

    initializer = this.#client().then(async (clientReader) => {
      const client = clientReader.view((value) => {
        if (value.DefaultCurrency !== currency) {
          throw new SaxoBankDefaultCurrencyMismatchError(currency, value.DefaultCurrency)
        }

        return {
          key: value.ClientKey,
          currency: value.DefaultCurrency,
        }
      })

      const clientBalance = await this.#balance({ clientKey: client.value.key })

      const balance = clientBalance.view((value) => {
        if (value.Currency !== currency) {
          throw new SaxoBankDefaultCurrencyMismatchError(currency, value.Currency)
        }

        return mapClientBalance(value)
      })

      let value = {
        key: client.value.key,
        currency: client.value.currency,
        balance: balance.value,
      }

      const combinedReader = new DataContextReader({
        dispose: async () => {
          await clientBalance.dispose()

          if (this.#error !== undefined) {
            throw this.#error
          }
        },
        read: () => {
          return value
        },
        refresh: async () => {
          await Promise.allSettled([
            clientReader.refresh(),
            clientBalance.refresh(),
          ])

          value = {
            key: client.value.key,
            currency: client.value.currency,
            balance: balance.value,
          }
        },
      })

      this.#appReaders.set('client', combinedReader)

      return combinedReader
    }).finally(() => {
      this.#initializers.delete('client')
    })

    return initializer as ReaderPromise
  }

  account({ accountID, currency }: { readonly accountID: string; readonly currency: Currency3 }): Promise<
    DataContextReader<DataContextAccount>
  > {
    type ReaderPromise = ReturnType<DataContext['account']>
    type Reader = Awaited<ReaderPromise>

    const key = 'account-' + accountID

    const reader = this.#appReaders.get(key)

    if (reader !== undefined) {
      return Promise.resolve(reader as Reader)
    }

    let initializer = this.#initializers.get(key) as undefined | ReaderPromise

    if (initializer !== undefined) {
      return initializer
    }

    initializer = this.#client().then(async (clientReader) => {
      const accountsReader = await this.#accounts({ clientKey: clientReader.value.ClientKey })

      const accountNotFound = accountsReader.value.find((account) => account.AccountId === accountID) === undefined

      if (accountNotFound) {
        throw new SaxoBankAccountNotFoundError(accountID)
      }

      const account = accountsReader.view((accounts) => {
        const found = accounts.find((account) => account.AccountId === accountID)

        if (found === undefined) {
          throw new SaxoBankAccountNotFoundError(accountID)
        }

        if (found.Currency !== currency) {
          throw new SaxoBankAccountCurrencyMismatchError(accountID, currency, found.Currency)
        }

        return {
          ID: found.AccountId,
          key: found.AccountKey,
        }
      })

      const balanceReader = await this.#balance({
        clientKey: clientReader.value.ClientKey,
        accountKey: account.value.key,
      })

      const balance = balanceReader.view((value) => {
        if (value.Currency !== currency) {
          throw new SaxoBankAccountCurrencyMismatchError(accountID, currency, value.Currency)
        }

        return mapAccountBalance(accountID, value)
      })

      let value = {
        ID: account.value.ID,
        key: account.value.key,
        currency,
        balance: balance.value,
      }

      const combinedReader = new DataContextReader({
        dispose: async () => {
          await balanceReader.dispose()

          if (this.#error !== undefined) {
            throw this.#error
          }
        },
        read: () => {
          return value
        },
        refresh: async () => {
          await Promise.allSettled([
            accountsReader.refresh(),
            balanceReader.refresh(),
          ])

          value = {
            ID: account.value.ID,
            key: account.value.key,
            currency,
            balance: balance.value,
          }
        },
      })

      this.#appReaders.set(key, combinedReader)

      return combinedReader
    }).finally(() => {
      this.#initializers.delete(key)
    })

    return initializer as ReaderPromise
  }

  readonly #instruments = new Map<string, InstrumentDetailsUnion>()

  async preloadInstruments(
    options: ReadonlyArray<
      { readonly assetType: InstrumentDetailsUnion['AssetType']; readonly uics: readonly number[] }
    >,
  ): Promise<void> {
    for (const { assetType, uics } of options) {
      if (uics.length === 0) {
        continue
      }

      const unknownUics: number[] = []

      for (const uic of uics) {
        const existing = this.#instruments.get(`${assetType}:${uic}`)

        if (existing === undefined) {
          unknownUics.push(uic)
          continue
        }
      }

      if (unknownUics.length === 0) {
        continue
      }

      const instruments = await toArray(
        this.app.referenceData.instruments.details.get({
          AssetTypes: [assetType],
          Uics: unknownUics as [number, ...number[]],
        }, {
          signal: this.#controller.signal,
        }),
      )

      for (const uic of unknownUics) {
        const instrument = instruments.find((i) => i.Uic === uic)

        if (instrument === undefined) {
          throw new SaxoBankInstrumentUICNotFoundError(assetType, uic)
        }

        if (instrument.AssetType !== assetType) {
          throw new Error(`AssetType mismatch for instrument with Uic ${uic}`)
        }

        if (isInstrumentTradable(instrument, assetType) === false) {
          throw new SaxoBankInstrumentUICNotTradableError(assetType, uic)
        }

        this.#instruments.set(`${assetType}:${uic}`, instrument)
      }
    }
  }

  async preloadInstrumentsBySymbol(
    options: ReadonlyArray<
      { readonly assetType: InstrumentDetailsUnion['AssetType']; readonly symbols: readonly string[] }
    >,
  ): Promise<void> {
    const preloadOptions: Array<
      { readonly assetType: InstrumentDetailsUnion['AssetType']; readonly uics: readonly number[] }
    > = []

    for (const { assetType, symbols } of options) {
      if (symbols.length === 0) {
        continue
      }

      const unknownSymbols: string[] = []

      for (let symbol of symbols) {
        symbol = symbol.toUpperCase()
        let found = false

        for (const instrument of this.#instruments.values()) {
          if (instrument.Symbol === symbol) {
            if (instrument.AssetType !== assetType) {
              throw new SaxoBankInstrumentSymbolAssetTypeMismatchError(assetType, instrument.AssetType, symbol)
            }

            found = true
            break
          }
        }

        if (found) {
          continue
        }

        unknownSymbols.push(symbol)
      }

      if (unknownSymbols.length === 0) {
        continue
      }

      const instruments = await Promise.allSettled(
        unknownSymbols.map(async (symbol) => {
          const [instrument] = await toArray<InstrumentSummaryInfoType>(this.app.referenceData.instruments.get({
            AssetTypes: [assetType],
            Keywords: [symbol],
            IncludeNonTradable: false,
            limit: 1,
          }))

          if (instrument === undefined) {
            throw new SaxoBankInstrumentSymbolNotFoundError(assetType, symbol)
          }

          if (instrument.AssetType !== assetType) {
            throw new SaxoBankInstrumentSymbolAssetTypeMismatchError(assetType, instrument.AssetType, symbol)
          }

          return instrument
        }),
      ).then((results) => {
        return results.map<InstrumentSummaryInfoType>((result) => {
          if (result.status === 'rejected') {
            throw result.reason
          }

          return result.value
        })
      })

      preloadOptions.push({ assetType, uics: instruments.map((i) => i.Identifier) })
    }

    await this.preloadInstruments(preloadOptions)
  }

  async instrument<T extends InstrumentDetailsUnion['AssetType']>(
    { assetType, uic }: { readonly assetType: T; readonly uic: number },
  ): Promise<DataContextReaderView<InstrumentDetails[T]>> {
    await this.preloadInstruments([{ assetType, uics: [uic] }])

    const reader = await this.#createAppReader({
      key: `instruments`,
      wait: 39 * 60 * 1000, // 39 minutes
      read: async (signal): Promise<ReadonlyMap<string, InstrumentDetailsUnion>> => {
        if (this.#instruments.size === 0) {
          return this.#instruments
        }

        try {
          const uics = [...this.#instruments.values().map((i) => i.Uic)] as [number, ...number[]]

          const instruments = await toArray(
            this.app.referenceData.instruments.details.get(
              { Uics: uics },
              { signal },
            ),
          )

          const instrumentsMap = new Map<string, InstrumentDetailsUnion>()

          for (const instrument of instruments) {
            if (isInstrumentTradable(instrument)) {
              instrumentsMap.set(`${instrument.AssetType}:${instrument.Uic}`, instrument)
            }
          }

          if (signal !== undefined && signal.aborted) {
            return this.#instruments
          }

          for (const instrument of this.#instruments.values()) {
            const instrumentKey = `${instrument.AssetType}:${instrument.Uic}`
            const downloaded = instrumentsMap.get(instrumentKey)

            if (downloaded === undefined) {
              this.#instruments.delete(instrumentKey)
              continue
            }

            this.#instruments.set(instrumentKey, downloaded)
          }

          return this.#instruments
        } catch (error) {
          if (error instanceof HTTPClientRequestAbortError) {
            return this.#instruments
          }

          throw error
        }
      },
      map: (value) => value,
    })

    const instrumentKey = `${assetType}:${uic}`

    return reader.view((instruments) => {
      const instrument = instruments.get(instrumentKey)

      if (instrument === undefined) {
        throw new SaxoBankInstrumentUICNotFoundError(assetType, uic)
      }

      if (instrument.AssetType !== assetType) {
        throw new SaxoBankInstrumentUICAssetTypeMismatchError(assetType, instrument.AssetType, uic)
      }

      return instrument as InstrumentDetails[T]
    })
  }

  async instrumentBySymbol<T extends InstrumentDetailsUnion['AssetType']>({
    assetType,
    symbol,
  }: {
    readonly assetType: T
    readonly symbol: string
  }): Promise<DataContextReaderView<InstrumentDetails[T]>> {
    await this.preloadInstrumentsBySymbol([{ assetType, symbols: [symbol] }])

    symbol = symbol.toUpperCase()

    let uic: undefined | number = undefined

    for (const instrument of this.#instruments.values()) {
      if (instrument.Symbol === symbol) {
        if (instrument.AssetType !== assetType) {
          throw new SaxoBankInstrumentSymbolAssetTypeMismatchError(assetType, instrument.AssetType, symbol)
        }

        uic = instrument.Uic
        break
      }
    }

    if (uic === undefined) {
      throw new SaxoBankInstrumentSymbolNotFoundError(assetType, symbol)
    }

    return this.instrument({ assetType, uic })
  }

  async instrumentFirstMatch<T extends InstrumentDetailsUnion['AssetType']>({
    assetType,
    symbols,
  }: {
    readonly assetType: T
    readonly symbols: readonly string[]
  }): Promise<DataContextReaderView<InstrumentDetails[T]>> {
    await this.preloadInstrumentsBySymbol([{ assetType, symbols }]).catch((error) => {
      if (error instanceof SaxoBankInstrumentNotFoundError === false) {
        throw error
      }
    })

    for (const symbol of symbols) {
      try {
        return await this.instrumentBySymbol({ assetType, symbol })
      } catch (error) {
        if (error instanceof SaxoBankInstrumentNotFoundError) {
          continue
        }

        throw error
      }
    }

    throw new SaxoBankInstrumentSymbolsNotFoundError(assetType, symbols)
  }

  async tryInstrument<T extends InstrumentDetailsUnion['AssetType']>({
    assetType,
    uic,
  }: {
    readonly assetType: T
    readonly uic: number
  }): Promise<undefined | DataContextReaderView<InstrumentDetails[T]>> {
    try {
      return await this.instrument({ assetType, uic })
    } catch (error) {
      if (error instanceof SaxoBankInstrumentNotFoundError) {
        return undefined
      }

      throw error
    }
  }

  async tryInstrumentBySymbol<T extends InstrumentDetailsUnion['AssetType']>({
    assetType,
    symbol,
  }: {
    readonly assetType: T
    readonly symbol: string
  }): Promise<undefined | DataContextReaderView<InstrumentDetails[T]>> {
    try {
      return await this.instrumentBySymbol({ assetType, symbol })
    } catch (error) {
      if (error instanceof SaxoBankInstrumentNotFoundError) {
        return undefined
      }

      throw error
    }
  }

  async tryInstrumentFirstMatch<T extends InstrumentDetailsUnion['AssetType']>({
    assetType,
    symbols,
  }: {
    readonly assetType: T
    readonly symbols: readonly string[]
  }): Promise<undefined | DataContextReaderView<InstrumentDetails[T]>> {
    try {
      return await this.instrumentFirstMatch({ assetType, symbols })
    } catch (error) {
      if (error instanceof SaxoBankInstrumentSymbolsNotFoundError) {
        return undefined
      }

      throw error
    }
  }

  async quoteSnapshot<T extends keyof InfoPriceRequest>(
    { assetType, uic }: { readonly assetType: T; readonly uic: number },
  ): Promise<DataContextQuoteSnapshot> {
    const { Quote, LastUpdated } = await this.app.trading.infoPrices.get({
      AssetType: assetType,
      Uic: uic,
    } as never)

    if (Quote.Ask === undefined) {
      throw new Error('Ask is undefined')
    }

    if (Quote.Bid === undefined) {
      throw new Error('Bid is undefined')
    }

    return {
      updatedAt: LastUpdated,
      ask: {
        price: Quote.Ask,
        size: Quote.AskSize ?? 0,
      },
      bid: {
        price: Quote.Bid,
        size: Quote.BidSize ?? 0,
      },
      midPrice: (Quote.Ask + Quote.Bid) / 2,
    }
  }

  async stock({ uic }: { readonly uic: number }): Promise<DataContextReaderView<DataContextStock>> {
    return await this.instrument({ assetType: 'Stock', uic }).then((reader) => {
      return reader.view((value) => {
        return {
          symbol: value.Symbol,
          description: value.Description,
          lot: calculateOrderLotSpecification(value),
          sum: calculateOrderSumSpecification(value),
          session: mapInstrumentSessions(value),
          roundPriceToTickSize: roundPriceToTickSize.bind(null, value),
        }
      })
    })
  }
}

export class DataContextReader<T> {
  readonly #dispose: () => Promise<void>
  readonly #read: () => T
  readonly #refresh: () => Promise<void>

  get value(): T {
    return this.#read()
  }

  constructor({ dispose, read, refresh }: { dispose(): Promise<void>; read(): T; refresh(): Promise<void> }) {
    this.#read = read

    this.#dispose = dispose
    this.#refresh = refresh
  }

  async dispose(): Promise<void> {
    await this.#dispose()
  }

  refresh(): Promise<void> {
    return this.#refresh()
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

type PickInstrumentDetails<T, K extends UnionKeys<T> = UnionKeys<T>> =
  & {
    [P in Extract<OptionalKeys<T>, K>]?: T extends unknown ? P extends keyof T ? T[P] : undefined : never
  }
  & {
    [P in Extract<RequiredKeys<T>, K>]: T extends unknown ? P extends keyof T ? T[P] : never : never
  }

type UnionKeys<T> = T extends unknown ? keyof T : never
type OptionalKeys<T> = T extends unknown ? { [K in keyof T]: undefined extends T[K] ? K : never }[keyof T] : never
type RequiredKeys<T> = {
  [K in Exclude<UnionKeys<T>, OptionalKeys<T>>]: undefined extends T[K] ? never : K
}[Exclude<UnionKeys<T>, OptionalKeys<T>>]

function isInstrumentTradable(
  instrument: InstrumentDetailsUnion,
  assetType?: undefined | InstrumentDetailsUnion['AssetType'],
): boolean {
  return (
    instrument.IsTradable &&
    instrument.NonTradableReason === 'None' &&
    instrument.TradingStatus === 'Tradable' &&
    (
      'Exchange' in instrument && instrument.Exchange !== undefined
    ) &&
    (
      assetType === undefined ||
      (
        'TradableAs' in instrument &&
        instrument.TradableAs !== undefined &&
        instrument.TradableAs.includes(assetType as never)
      )
    )
  )
}

function calculateOrderLotSpecification(
  instrument: PickInstrumentDetails<
    InstrumentDetailsUnion,
    'MinimumLotSize' | 'MinimumTradeSize' | 'LotSize' | 'LotSizeType' | 'OrderSetting'
  >,
): {
  readonly minimum: number
  readonly maximum: undefined | number
  readonly increment: number
} {
  const lotSize = instrument.LotSizeType === 'NotUsed' ? 1 : instrument.LotSize ?? 1

  return {
    minimum: Math.max(
      lotSize,
      instrument.MinimumTradeSize ?? 1,
      instrument.MinimumLotSize ?? 1,
    ),
    maximum: instrument.OrderSetting?.MaxOrderSize,
    increment: lotSize,
  }
}

function calculateOrderSumSpecification(
  instrument: PickInstrumentDetails<
    InstrumentDetailsUnion,
    'AssetType' | 'MinimumOrderValue' | 'OrderSetting' | 'Symbol' | 'Uic'
  >,
): {
  readonly minimum: undefined | number
  readonly maximum: undefined | number
} {
  if (
    instrument.MinimumOrderValue !== undefined && instrument.OrderSetting?.MinOrderValue !== undefined &&
    instrument.MinimumOrderValue !== instrument.OrderSetting?.MinOrderValue
  ) {
    // We dont know what to do, since we have never encountered this case.
    // Once we do, we can decide what to do by investigating the instrument in SaxoTrader.
    throw new Error(
      `MinimumOrderValue and OrderSetting.MinOrderValue do not match for asset "${instrument.AssetType}" on "${instrument.Symbol}" (UIC ${instrument.Uic})`,
    )
  }

  const minimum = instrument.OrderSetting?.MinOrderValue ?? instrument.MinimumOrderValue

  return {
    minimum,
    maximum: instrument.OrderSetting?.MaxOrderValue,
  }
}

function roundPriceToTickSize(
  instrument: PickInstrumentDetails<
    InstrumentDetailsUnion,
    'AssetType' | 'TickSizeScheme' | 'TickSize' | 'Format' | 'Symbol' | 'Uic'
  >,
  price: number,
): number {
  // See https://www.developer.saxo/openapi/learn/order-placement at section "Decimals, TickSize and Tick Size Schemes"
  let tickSize: undefined | number = undefined

  if (instrument.TickSizeScheme !== undefined) {
    tickSize = instrument.TickSizeScheme.Elements
      ?.toSorted((left, right) => left.HighPrice - right.HighPrice)
      .find((element) => price <= element.HighPrice)
      ?.TickSize ??
      instrument.TickSizeScheme.DefaultTickSize
  } else if (instrument.TickSize !== undefined) {
    tickSize = instrument.TickSize
  } else if (instrument.Format !== undefined) {
    // A price is always denoted in the the number of decimals supported by the instrument.
    // The number of decimals can be found on the instrument data looked up in the Reference Data.
    // However for certain Fx crosses the number is one higher if the format has the flag AllowDecimalPips.
    const decimals = instrument.Format.Decimals +
      (instrument.Format.Format === 'AllowDecimalPips' ? 1 : 0)

    tickSize = 1 / 10 ** decimals
  }

  if (tickSize === undefined) {
    throw new Error(
      `Tick size not found for asset "${instrument.AssetType}" on "${instrument.Symbol}" (UIC ${instrument.Uic})`,
    )
  }

  // Calculate the precision based on the tick size
  const precision = Math.ceil(-Math.log10(tickSize))
  const roundedPrice = Math.round((price + Number.EPSILON) / tickSize) * tickSize

  // Fix the precision to avoid floating-point artifacts
  return parseFloat(roundedPrice.toFixed(precision))
}
