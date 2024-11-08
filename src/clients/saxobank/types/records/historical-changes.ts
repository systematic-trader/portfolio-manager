import {
  type GuardType,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface HistoricalChanges extends GuardType<typeof HistoricalChanges> {}

/**
 * Historical data about the price changes (in %) for a number of periods, from 1 week to 5 years.
 *
 * Price values are depending on a subscription to a feed.
 * This can mean no data, delayed data or real time data dependent on the callers subscription setup.
 */
export const HistoricalChanges = props({
  /** The 52 week high */
  FiftyTwoWeekHigh: optional(number()),

  /** The 52 week low */
  FiftyTwoWeekLow: optional(number()),

  /** The 1 month percent change */
  PercentChange1Month: optional(number()),

  /** The 1 year percent change */
  PercentChange1Year: optional(number()),

  /** The 2 months percent change */
  PercentChange2Months: optional(number()),

  /** The 2 years percent change */
  PercentChange2Years: optional(number()),

  /** The 3 months percent change */
  PercentChange3Months: optional(number()),

  /** The 3 years percent change */
  PercentChange3Years: optional(number()),

  /** The 5 years percent change */
  PercentChange5Years: optional(number()),

  /** The 6 months percent change */
  PercentChange6Months: optional(number()),

  /** The daily percent change */
  PercentChangeDaily: optional(number()),

  /** The weekly percent change */
  PercentChangeWeekly: optional(number()),
})
