import { toArray } from '../../../utils/async-iterable.ts'
import { SaxoBankApplication } from '../../saxobank-application.ts'
import type { Currency3 } from '../types/derives/currency.ts'
import { DataContext } from './data-context.ts'
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
  readonly accounts: {
    [K in keyof Options['accounts'] & string]: SaxoBankAccount<{ accountID: K; currency: Options['accounts'][K] }>
  }

  readonly positions: {
    readonly unrealized: number
  }

  /** The protection limit of the broker accounts. */
  readonly protectionLimit: number

  dispose(): Promise<void>

  refresh(): void
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
  const context = new DataContext({ type: options.type })

  try {
    const clientReader = await context.client().then((reader) => {
      return reader.view((value) => {
        if (value.PositionNettingProfile !== 'FifoRealTime') {
          throw new SaxoBankBrokerOptionsError('Position Netting must be Real-time FIFO')
        }

        return {
          clientKey: value.ClientKey,
          name: value.Name,
          nettingProfile: value.PositionNettingProfile,
          protectionLimit: value.AccountValueProtectionLimit ?? 0,
        }
      })
    })

    const clientBalanceReader = await context.balance({ clientKey: clientReader.value.clientKey }).then((reader) => {
      return reader.view((value) => {
        if (options.currency !== value.currency) {
          throw new SaxoBankBrokerOptionsError(
            `Broker currency must be set to "${value.currency}" and not "${options.currency}"`,
          )
        }

        return value
      })
    })

    const accountsReader = await context.accounts({ clientKey: clientReader.value.clientKey }).then((reader) => {
      return reader.view((value) => {
        for (const [accountId, accountCurrency] of Object.entries(options.accounts)) {
          const account = value.find((account) => account.AccountId === accountId)
          if (account === undefined) {
            throw new SaxoBankBrokerOptionsError(`Broker account unknown: "${accountId}"`)
          }

          if (account.Currency !== accountCurrency) {
            throw new SaxoBankBrokerOptionsError(
              `Broker account "${accountId}" currency must be set to "${account.Currency}" and not "${accountCurrency}"`,
            )
          }
        }

        return value
      })
    })

    const broker = {
      currency: options.currency,

      get protectionLimit() {
        return clientReader.value.protectionLimit
      },

      get cash() {
        return clientBalanceReader.value.cash
      },

      margin: {
        get available() {
          return clientBalanceReader.value.marginAvailable
        },
        get used() {
          return clientBalanceReader.value.marginUsed
        },
        get total() {
          return clientBalanceReader.value.marginTotal
        },
        get utilization() {
          return clientBalanceReader.value.marginUtilization
        },
      },

      positions: {
        get unrealized() {
          return clientBalanceReader.value.positionsUnrealized
        },
      },

      get total() {
        return clientBalanceReader.value.total
      },

      [Symbol.asyncDispose](): Promise<void> {
        return context[Symbol.asyncDispose]()
      },

      accounts: Object.fromEntries(
        await Promise.allSettled(
          Object.keys(options.accounts).map(async (accountID) => {
            const account = accountsReader.value.find((account) => account.AccountId === accountID)!
            const accountBalance = await context.balance({
              clientKey: clientReader.value.clientKey,
              accountKey: account.AccountKey,
            })

            return new SaxoBankAccount(
              {
                context,
                balance: accountBalance,
                currencyConversionFee: options.currencyConversionFee ?? DEFAULTS.currencyConversionFee,
                accountID,
                currency: options.accounts[accountID] as Currency3,
              },
            )
          }),
        ).then((results) => {
          return results.map((result) => {
            if (result.status === 'rejected') {
              throw result.reason
            }

            return [result.value.ID, result.value] as const
          })
        }),
      ) as SaxoBankBroker<Options>['accounts'],

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
