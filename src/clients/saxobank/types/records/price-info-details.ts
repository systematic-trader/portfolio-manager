import {
  type GuardType,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface PriceInfoDetails extends GuardType<typeof PriceInfoDetails> {}

/**
 * Additional information related to the instrument.
 * Price values are depending on a subscription to a feed.
 * This can mean no data, delayed data or real time data dependent on the callers subscription setup.
 */
export const PriceInfoDetails = props({
  /** The ask size (Please consider to use 'Quote.AskSize') */
  AskSize: optional(number()),

  /** Optional ask yield, if available */
  AskYield: optional(number()),

  /** The bid size (Please consider to use 'Quote.BidSize') */
  BidSize: optional(number()),

  /** Optional bid yield, if available */
  BidYield: optional(number()),

  /** The last close */
  LastClose: number(),

  /** The last traded */
  LastTraded: number(),

  /** The last traded size */
  LastTradedSize: number(),

  /** The open */
  Open: number(),

  /** Optional volume, if available */
  Volume: number(),
})
