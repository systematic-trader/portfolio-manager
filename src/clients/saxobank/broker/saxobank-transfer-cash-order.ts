import { HTTPClientError } from '../../http-client.ts'
import type { Currency3 } from '../types/derives/currency.ts'
import type { DataContext } from './data-context.ts'
import {
  SaxoBankAccountTransferInsufficientCashError,
  SaxoBankAccountTransferPermissionError,
  SaxoBankMarketClosedError,
} from './errors.ts'
import type { MarketSession } from './market-session.ts'
import type { SaxoBankAccount } from './saxobank-account.ts'

export class SaxoBankTransferCashOrder<
  Options extends {
    readonly from: { readonly accountID: string; readonly currency: Currency3 }
    readonly to: { readonly accountID: string; readonly currency: Currency3 }
    readonly transfer: { readonly currency: Currency3; readonly amount: number }
  },
> {
  readonly #context: DataContext
  readonly #currency: Options['transfer']['currency']
  readonly #amount: Options['transfer']['amount']

  /** The current market session. */
  readonly session: MarketSession

  /** The 'from' account, amount and estimated commission. */
  readonly from: {
    /** The account to transfer from. */
    readonly account: SaxoBankAccount<
      { accountID: Options['from']['accountID']; currency: Options['from']['currency'] }
    >
    /** The amount to withdraw. */
    readonly withdraw: number
    /** The estimated commission of the transfer. */
    readonly commission: number
  }

  /** The 'to' account and amount. */
  readonly to: {
    /** The account to transfer to. */
    readonly account: SaxoBankAccount<{ accountID: Options['to']['accountID']; currency: Options['to']['currency'] }>
    /** The amount to deposit. */
    readonly deposit: number
  }

  /** The estimated rate of the transfer. */
  readonly rate: number

  constructor(options: {
    readonly context: DataContext
    readonly session: MarketSession
    readonly transfer: { currency: Options['transfer']['currency']; amount: Options['transfer']['amount'] }
    readonly from: {
      readonly account: SaxoBankAccount<Options['from']>
      readonly withdraw: number
      readonly commission: number
    }
    readonly to: { readonly account: SaxoBankAccount<Options['to']>; readonly deposit: number }
    readonly rate: number
  }) {
    this.#context = options.context
    this.#currency = options.transfer.currency
    this.#amount = options.transfer.amount
    this.session = options.session
    this.from = options.from
    this.to = options.to
    this.rate = options.rate
  }

  /** Executes the transfer. */
  async execute(): Promise<{
    readonly from: {
      readonly account: SaxoBankAccount<{
        readonly accountID: Options['from']['accountID']
        readonly currency: Options['from']['currency']
      }>
      readonly withdrawn: number
      readonly commission: number
    }
    readonly to: {
      readonly account: SaxoBankAccount<{
        readonly accountID: Options['to']['accountID']
        readonly currency: Options['to']['currency']
      }>
      readonly deposited: number
    }
    readonly rate: number
  }> {
    try {
      const response = await this.#context.app.clientServices.cashManagement.interAccountTransfers.post({
        FromAccountKey: this.from.account.key,
        ToAccountKey: this.to.account.key,
        Currency: this.#currency,
        Amount: this.#amount,
      })

      const rate = this.from.account.currency === this.#currency
        ? response.ToAccountAmount / (response.FromAccountAmount + response.Commission)
        : (response.ToAccountAmount - response.Commission) / response.FromAccountAmount
      const commission = this.from.account.currency === this.#currency
        ? response.Commission
        : response.Commission * (1 / rate)

      return {
        from: {
          account: this.from.account,
          withdrawn: response.FromAccountAmount,
          commission,
        },
        to: {
          account: this.to.account,
          deposited: response.ToAccountAmount,
        },
        rate,
      }
    } catch (error) {
      //  API throws 403 Forbidden if the account is not allowed to transfer cash
      if (error instanceof HTTPClientError) {
        if (error.statusCode === 403) {
          throw new SaxoBankAccountTransferPermissionError({
            fromAccountID: this.from.account.ID,
            toAccountID: this.to.account.ID,
          })
        }

        if (
          error.statusCode === 400 && error.body !== null && typeof error.body === 'object' &&
          'ErrorCode' in error.body
        ) {
          if (error.body.ErrorCode === 'CrossCurrencyTransferNotAllowedWhenMarketIsClosed') {
            throw new SaxoBankMarketClosedError('Cross currency transfer not allowed when market is closed')
          }

          if (error.body.ErrorCode === 'InsufficientCash') {
            throw new SaxoBankAccountTransferInsufficientCashError({
              account: this.from.account,
              withdraw: this.from.withdraw,
            })
          }
        }
      }

      throw error
    }
  }
}
