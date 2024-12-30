import { toArray } from '../../../utils/async-iterable.ts'
import { SaxoBankApplication } from '../../saxobank-application.ts'
import { SaxoBankStream } from '../../saxobank-stream.ts'
import type { SaxoBankSubscriptionBalance } from '../stream/subscriptions/saxobank-subscription-balance.ts'
import type { Currency3 } from '../types/derives/currency.ts'
import { SaxoBankAccount } from './saxobank-account.ts'

export interface SaxoBankBrokerOptions {
  /** Type of the application. */
  readonly type?: undefined | SaxoBankApplication['type']
  /** The primary currency used to display collective broker values. */
  readonly currency: Currency3
  /** The accounts of the broker. */
  readonly accounts: Record<string, Currency3> // { '3432432INET': 'USD' }
  /** The fee for converting currency in percent. */
  readonly currencyConversionFee?: undefined | number
}

export interface SaxoBankBroker<Options extends SaxoBankBrokerOptions> extends AsyncDisposable {
  /** The primary currency used to display collective values of broker currency accounts . */
  readonly currency: Options['currency']

  /** The collective funds available for trading. */
  readonly cash: number // kontantbeholdning

  /** The collective total value of the broker accounts displayed in the primary currency. */
  readonly total: number

  /** The collective margin of the broker accounts displayed in the primary currency. */
  readonly margin: {
    /** The margin available for trading. */
    readonly available: number // Global: Initial margin til rådighed
    /** The margin used for trading. */
    readonly used: number // Global: Initial margin brugt
    /** The total margin value of the broker accounts. */
    readonly total: number // Global: Samlede margin til rådighed inkl. margin på åbne positioner
    /** The margin utilization of the broker accounts. */
    readonly utilization: number // Global: margin utilization
  }

  /** The accounts of the broker. */
  readonly accounts: {
    [K in keyof Options['accounts'] & string]: SaxoBankAccount<{ accountID: K; currency: Options['accounts'][K] }>
  }

  readonly positions: {
    readonly unrealized: number
  }

  /** The protection limit of the broker accounts. */
  readonly protectionLimit: number

  dispose(): Promise<void>
}

export class SaxoBankBrokerOptionsError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export async function SaxoBankBroker<const Options extends SaxoBankBrokerOptions>(
  options: SaxoBankBrokerOptions,
): Promise<SaxoBankBroker<Options>> {
  using app = new SaxoBankApplication({ type: options.type })

  const client = await app.portfolio.clients.me()

  if (client.PositionNettingProfile !== 'FifoRealTime') {
    throw new Error('Position Netting must be Real-time FIFO')
  }

  const accounts = await toArray(app.portfolio.accounts.get({
    ClientKey: client.ClientKey,
    IncludeSubAccounts: true,
  })).then((accounts) => {
    return accounts
      .filter((account) =>
        account.Active === true &&
        account.AccountSubType === 'None' &&
        account.AccountType === 'Normal'
      )
  })

  for (const [accountId, accountCurrency] of Object.entries(options.accounts)) {
    const account = accounts.find((account) => account.AccountId === accountId)
    if (account === undefined) {
      throw new SaxoBankBrokerOptionsError(`Broker account unknown: "${accountId}"`)
    }

    if (account.Currency !== accountCurrency) {
      throw new SaxoBankBrokerOptionsError(
        `Broker account "${accountId}" currency must be set to "${account.Currency}" and not "${accountCurrency}"`,
      )
    }
  }

  const initializePromises: Promise<unknown>[] = []

  const stream = new SaxoBankStream({ app })

  try {
    const clientBalance = stream.balance({ ClientKey: client.ClientKey })

    initializePromises.push(clientBalance.initialize())

    const accountBalances: SaxoBankSubscriptionBalance[] = []

    const accountsRecord = Object.keys(
      options.accounts,
    ).reduce<Record<string, SaxoBankAccount<{ accountID: string; currency: Currency3 }>>>((result, accountID) => {
      const account = accounts.find((account) => account.AccountId === accountID)!
      const accountBalance = stream.balance({ ClientKey: client.ClientKey, AccountKey: account.AccountKey })

      accountBalances.push(accountBalance)

      initializePromises.push(accountBalance.initialize())

      result[accountID] = new SaxoBankAccount({
        accountID,
        currency: options.accounts[accountID] as Currency3,
        balance: accountBalance,
      }, accountBalance)

      return result
    }, {}) as SaxoBankBroker<Options>['accounts']

    for (const initializeResult of await Promise.allSettled(initializePromises)) {
      if (initializeResult.status === 'rejected') {
        throw initializeResult.reason
      }
    }

    if (clientBalance.message.Currency !== options.currency) {
      throw new SaxoBankBrokerOptionsError(
        `Broker currency must be set to "${clientBalance.message.Currency}" and not "${options.currency}"`,
      )
    }

    const margin = {
      get available() {
        return clientBalance.message.MarginAvailableForTrading ?? 0
      },
      get used() {
        return clientBalance.message.MarginUsedByCurrentPositions ?? 0
      },
      get total() {
        const { MarginAvailableForTrading, MarginUsedByCurrentPositions } = clientBalance.message

        return (MarginAvailableForTrading ?? 0) + (MarginUsedByCurrentPositions ?? 0)
      },
      get utilization() {
        return (clientBalance.message.MarginUtilizationPct ?? 0) / 100
      },
    }

    const positions = {
      get unrealized() {
        return clientBalance.message.UnrealizedPositionsValue
      },
    }

    const broker = {
      currency: options.currency,
      get cash() {
        return clientBalance.message.CashBalance
      },
      margin,
      positions,
      protectionLimit: client.AccountValueProtectionLimit ?? 0,
      get total() {
        return clientBalance.message.TotalValue
      },

      [Symbol.asyncDispose](): Promise<void> {
        return broker.dispose()
      },

      accounts: accountsRecord,

      async dispose(): Promise<void> {
        await stream[Symbol.asyncDispose]()
        app.dispose()
      },
    }

    return broker
  } catch (error) {
    await stream.dispose()
    app.dispose()

    throw error
  }
}

SaxoBankBroker.options = async function options(
  { type }: { readonly type?: undefined | SaxoBankApplication['type'] } = {},
): Promise<SaxoBankBrokerOptions> {
  using app = new SaxoBankApplication({ type })

  const client = await app.portfolio.clients.me()

  return Promise.allSettled(
    [
      app.portfolio.balances.get({ ClientKey: client.ClientKey }).then((balance) => {
        return ['currency', balance.Currency] as const
      }),
      await toArray(app.portfolio.accounts.get()).then((accounts) => {
        const record = accounts.reduce<Record<string, Currency3>>((result, account) => {
          if (account.Active === true && account.AccountSubType === 'None' && account.AccountType === 'Normal') {
            result[account.AccountId] = account.Currency
          }

          return result
        }, {})

        return ['accounts', record] as const
      }),
    ] as const,
  ).then((results) => {
    const entries = results.map((result) => {
      if (result.status === 'rejected') {
        throw result.reason
      }

      return result.value
    })

    return Object.fromEntries([['type', type], ...entries]) as SaxoBankBrokerOptions
  })
}
