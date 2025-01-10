import { toArray } from '../../../utils/async-iterable.ts'
import { SaxoBankApplication } from '../../saxobank-application.ts'
import type { Currency3 } from '../types/derives/currency.ts'
import { DataContext } from './data-context.ts'
import { SaxoBankAccountNotFoundError } from './errors.ts'
import { SaxoBankAccount } from './saxobank-account.ts'

const DEFAULTS = {
  currencyConversionFee: 0.0025,
} as const

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
  readonly accounts:
    & {
      [K in keyof Options['accounts'] & string]: SaxoBankAccount<{ accountID: K; currency: Options['accounts'][K] }>
    }
    & {
      /** Get the account by ID and currency. */
      get<AccountID extends string, Currency extends Currency3>(
        { ID, currency }: { readonly ID: AccountID; readonly currency: Currency },
      ): Promise<undefined | SaxoBankAccount<{ accountID: string; currency: Currency3 }>>
    }

  readonly positions: {
    readonly unrealized: number
  }

  /** Dispose of the broker and release resources. */
  dispose(): Promise<void>

  /** Refresh the broker data. */
  refresh(): void
}

export async function SaxoBankBroker<const Options extends SaxoBankBrokerOptions>(
  options: SaxoBankBrokerOptions,
): Promise<SaxoBankBroker<Options>> {
  const context = new DataContext({ type: options.type })

  try {
    const client = await context.client({ currency: options.currency })

    const accountInitializers = new Map<string, Promise<unknown>>()

    const accounts = {
      get: ({ ID, currency }: { readonly ID: string; readonly currency: Currency3 }) => {
        const account = accounts[ID]

        if (account !== undefined) {
          return account
        }

        let initializer = accountInitializers.get(ID)

        if (initializer !== undefined) {
          return initializer as Promise<SaxoBankAccount<{ accountID: string; currency: Currency3 }>>
        }

        initializer = context.account({ accountID: ID, currency }).then((accountReader) => {
          const account = new SaxoBankAccount({
            context,
            account: accountReader,
            currencyConversionFee: options.currencyConversionFee ?? DEFAULTS.currencyConversionFee,
          })

          Reflect.set(accounts, ID, account)

          return account
        }).catch((error) => {
          if (error instanceof SaxoBankAccountNotFoundError) {
            return undefined
          }

          throw error
        }).finally(() => {
          accountInitializers.delete(ID)
        })

        return initializer as Promise<SaxoBankAccount<{ accountID: string; currency: Currency3 }>>
      },
    } as SaxoBankBroker<Options>['accounts']

    await Promise.allSettled(
      Object.entries(options.accounts).map(async ([accountID, accountCurrency]) => {
        return new SaxoBankAccount({
          context,
          account: await context.account({ accountID, currency: accountCurrency }),
          currencyConversionFee: options.currencyConversionFee ?? DEFAULTS.currencyConversionFee,
        })
      }),
    ).then((results) => {
      return results.map((result) => {
        if (result.status === 'rejected') {
          throw result.reason
        }

        Reflect.set(accounts, result.value.ID, result.value)
      })
    })

    const broker = {
      get currency() {
        return client.value.currency
      },

      get cash() {
        return client.value.balance.cash
      },

      margin: {
        get available() {
          return client.value.balance.marginAvailable
        },
        get used() {
          return client.value.balance.marginUsed
        },
        get total() {
          return client.value.balance.marginTotal
        },
        get utilization() {
          return client.value.balance.marginUtilization
        },
      },

      positions: {
        get unrealized() {
          return client.value.balance.positionsUnrealized
        },
      },

      get total() {
        return client.value.balance.total
      },

      accounts,

      [Symbol.asyncDispose](): Promise<void> {
        return context[Symbol.asyncDispose]()
      },

      dispose(): Promise<void> {
        return broker[Symbol.asyncDispose]()
      },

      refresh(): void {
        context.refresh()
      },
    }

    return broker
  } catch (error) {
    await context.dispose()

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
