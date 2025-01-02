import type { Currency3 } from '../types/derives/currency.ts'
import type { MarketSession } from './market-session.ts'
import type { SaxoBankAccount } from './saxobank-account.ts'

export class SaxoBankTransferCashOrder<
  Options extends {
    readonly from: { readonly accountID: string; readonly currency: Currency3 }
    readonly to: { readonly accountID: string; readonly currency: Currency3 }
    readonly transfer: { readonly currency: Currency3; readonly amount: number }
  },
> {
  /** The 'from' account of the transfer. */
  readonly from: SaxoBankAccount<{ accountID: Options['from']['accountID']; currency: Options['from']['currency'] }>

  /** The 'to' account of the transfer. */
  readonly to: SaxoBankAccount<{ accountID: Options['to']['accountID']; currency: Options['to']['currency'] }>

  /** The currency of the amount. */
  readonly currency: Options['transfer']['currency']
  /** The amount to transfer. */
  readonly amount: Options['transfer']['amount']
  /** The conversion rate of the amount between the 'from' and 'to' accounts. */
  readonly rate: number

  readonly session: MarketSession

  constructor(options: {
    readonly from: SaxoBankAccount<Options['from']>
    readonly to: SaxoBankAccount<Options['to']>
    readonly transfer: { currency: Options['transfer']['currency']; amount: Options['transfer']['amount'] }
    readonly rate: number
    readonly session: MarketSession
  }) {
    this.from = options.from
    this.to = options.to
    this.currency = options.transfer.currency
    this.amount = options.transfer.amount
    this.rate = options.rate
    this.session = options.session
  }

  // /** Executes the transfer. */
  // execute(): Promise<{
  //   /** The resulting conversion rate of the transfer. */
  //   readonly rate: number
  //   /** The resulting amount of the transfered to account. */
  //   readonly amount: number
  // }> {
  //   return Promise.reject(new Error('Not implemented'))
  // }
}
