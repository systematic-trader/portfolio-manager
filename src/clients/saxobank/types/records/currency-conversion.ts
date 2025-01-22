import {
  type GuardType,
  number,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const CurrencyConversion = props({
  /** Gets or sets the ask */
  AskRate: number(),

  /** Gets or sets the bid */
  BidRate: number(),

  /** Gets or sets the markup */
  Markup: number(),
})

export interface CurrencyConversion extends GuardType<typeof CurrencyConversion> {}
