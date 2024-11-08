import {
  type GuardType,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface SpendingPower extends GuardType<typeof SpendingPower> {}

export const SpendingPower = props({
  /** The current spending power available */
  Current: number(),

  /** Spending power for shares / ETF (based on max collateral factor defined for shares) */
  Maximum: optional(number()),
})
