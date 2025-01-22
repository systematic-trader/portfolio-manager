import {
  type GuardType,
  number,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const FinancingInterest = props({
  /** The interbank rate. */
  InterbankRate: props({
    /** Ask rate for interbank. */
    AskRate: number(),

    /** Bid rate for interbank. */
    BidRate: number(),

    /** Trade date. */
    TradeDate: string({ format: 'date-iso8601' }),
  }),

  /** Financing interest markup. */
  Markup: number(),
})

export interface FinancingInterest extends GuardType<typeof FinancingInterest> {}
