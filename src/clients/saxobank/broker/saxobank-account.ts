import type { SaxoBankSubscriptionBalance } from '../stream/subscriptions/saxobank-subscription-balance.ts'
import type { Currency3 } from '../types/derives/currency.ts'

export class SaxoBankAccount<Options extends { readonly accountID: string; readonly currency: Currency3 }> {
  readonly #subscription: SaxoBankSubscriptionBalance

  /** The account ID. */
  readonly ID: Options['accountID'] // '3432432INET'

  /** The currency of the account. */
  readonly currency: Options['currency'] // Currency

  /** The cash available for trading. */
  get cash(): number {
    return this.#subscription.message.CashBalance
  }

  /** The total value of the account. */
  get total(): number {
    return this.#subscription.message.TotalValue
  }

  /** The margin of the account. */
  readonly margin: {
    /** The margin available for trading. */
    readonly available: number
    /** The margin used for trading. */
    readonly used: number
    /** The total margin value. */
    readonly total: number
    /** The margin utilization. */
    readonly utilization: number
  }

  constructor(options: Options, subscription: SaxoBankSubscriptionBalance) {
    this.ID = options.accountID
    this.currency = options.currency
    this.#subscription = subscription

    this.margin = {
      get available() {
        return subscription.message.MarginAvailableForTrading ?? 0
      },
      get used() {
        return subscription.message.MarginUsedByCurrentPositions ?? 0
      },
      get total() {
        const { MarginAvailableForTrading, MarginUsedByCurrentPositions } = subscription.message

        return (MarginAvailableForTrading ?? 0) + (MarginUsedByCurrentPositions ?? 0)
      },
      get utilization() {
        return (subscription.message.MarginUtilizationPct ?? 0) / 100
      },
    }
  }
}
