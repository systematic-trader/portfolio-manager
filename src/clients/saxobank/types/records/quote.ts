import {
  type GuardType,
  integer,
  literal,
  number,
  optional,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ErrorCode } from '../derives/error-code.ts'
import { MarketState } from '../derives/market-state.ts'
import { PriceQuality } from '../derives/price-quality.ts'
import { PriceSourceType } from '../derives/price-source-type.ts'

const Base = props({
  /** The amount for which the quote is calculated */
  Amount: integer(),

  /** If set, it defines the number of minutes by which the price is delayed */
  DelayedByMinutes: optional(integer()),

  /** Gets or sets the error code */
  ErrorCode: ErrorCode,

  /** Not documented */
  MarketState: optional(MarketState),

  /** The source for the price information */
  PriceSource: optional(string()),

  /**
   * Suggested price based on best available price information.
   * Typically used as suggested price when exchange is closed.
   */
  ReferencePrice: optional(number()),

  /** Not documented */
  PriceSourceType: PriceSourceType,

  /** Not documented */
  PriceValueType: optional(literal('AuctionPrice')),
})

/**
 * Additional information related to the instrument
 *
 * Price values are depending on a subscription to a feed.
 * This can mean no data, delayed data or real time data dependent on the callers subscription setup.
 */
export const Quote = union([
  // Both ask and bid are given
  Base.merge(props({
    PriceTypeAsk: PriceQuality.extract(['Tradable', 'Indicative', 'OldIndicative']),
    Ask: number(),
    AskSize: number(),

    PriceTypeBid: PriceQuality.extract(['Tradable', 'Indicative', 'OldIndicative']),
    Bid: number(),
    BidSize: number(),

    Mid: number(),
    MarketState: MarketState,
  })),

  // Ask is given, bid might not be given
  Base.merge(props({
    PriceTypeAsk: PriceQuality.extract(['Tradable', 'Indicative', 'OldIndicative']),
    Ask: number(),
    AskSize: number(),

    PriceTypeBid: PriceQuality.exclude(['Tradable', 'Indicative', 'OldIndicative']),
    Bid: optional(number()),
    BidSize: optional(number()),

    Mid: optional(number()),
    MarketState: MarketState,
  })),

  // Bid is given, ask might not be given
  Base.merge(props({
    PriceTypeAsk: PriceQuality.exclude(['Tradable', 'Indicative', 'OldIndicative']),
    Ask: optional(number()),
    AskSize: optional(number()),

    PriceTypeBid: PriceQuality.extract(['Tradable', 'Indicative', 'OldIndicative']),
    Bid: number(),
    BidSize: number(),

    Mid: optional(number()),
    MarketState: MarketState,
  })),

  // Neither ask nor bid may be given
  Base.merge(props({
    Amount: optional(Base.pluck('Amount')),

    PriceTypeAsk: PriceQuality.exclude(['Tradable', 'Indicative', 'OldIndicative']),
    Ask: optional(number()),
    AskSize: optional(number()),

    PriceTypeBid: PriceQuality.exclude(['Tradable', 'Indicative', 'OldIndicative']),
    Bid: optional(number()),
    BidSize: optional(number()),

    Mid: optional(number()),
    MarketState: optional(MarketState),
  })),
])

export type Quote = GuardType<typeof Quote>
