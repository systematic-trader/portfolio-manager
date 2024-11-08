import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type MarketState = GuardType<typeof MarketState>

export const MarketState = enums([
  /** Market is closed */
  'Closed',

  /**
   * Market is temporary out of normal Trading.
   * This is the Auction that occur after the market closes.
   */
  'ClosingAuction',

  /**
   * Market is temporary out of normal Trading.
   * In an Auction state This state is for Intraday Auction.
   * We have 2 specific states for Opening and Closing Auction.
   */
  'IntraDayAuction',

  /** Market is open for trades (Automatic Trading, usually) */
  'Open',

  /**
   * Market is temporary out of normal Trading.
   * This is the Auction that occur before the market opens.
   */
  'OpeningAuction',

  /** Market is in Post Market Auction state */
  'PostMarket',

  /** Market is in Pre Market Auction state */
  'PreMarket',

  /**
   * This state is after the Auction has finished,
   * before normal Trading starts.
   */
  'TradingAtLast',
])
