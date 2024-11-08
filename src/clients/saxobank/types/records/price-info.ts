import {
  type GuardType,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface PriceInfo extends GuardType<typeof PriceInfo> {}

/**
 * Price values are depending on a subscription to a feed.
 * This can mean no data, delayed data or real time data dependent on the callers subscription setup.
 */
export const PriceInfo = props({
  /** The high */
  High: number(),

  /** The low */
  Low: number(),

  /** The net change in price (Mid price – LastClose price) */
  NetChange: optional(number()),

  /**
   * The percent change in price.
   * If LastClose greater than 0, value = NetChange/LastClose * 100.
   * If NetChange less than 0, value = -100.
   * If NetChange equal to 0, value = 0.
   * If NetChange greater than 100, value = +100.
   */
  PercentChange: optional(number()),
})
