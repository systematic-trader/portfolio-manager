import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type OptionsStrategyType = GuardType<typeof OptionsStrategyType>

export const OptionsStrategyType = enums([
  /** Consists of two options, of same type and expiry, but with different amounts and strike prices */
  'BackRatio',

  /**
   * Non directional strategy that combines legs of same expiry,
   * but with varying amounts and strike prices.
   */
  'Butterfly',

  /**
   * A calendar spread is a long-short position is two calls or two puts.
   * Both options have the same strike, but they have different expirations.
   */
  'CalendarSpread',

  /** Sell call, buy put at lower strike. Buy call, Sell put at lower strike (1:1 ratio) */
  'Combo',

  /**
   * A condor strategy leverages four options with same expiry.
   * A buy and a sell in the money, and a buy and a sell out of the money.
   * Can also be characterized as two call spreads.
   */
  'Condor',

  /** User defined custom strategy */
  'Custom',

  /**
   * A diagonal spread is two options of the same type, one buy and one sell,
   * but with different expiry times and different strike prices.
   * Essentially a combination of a Vertical and Calendar spread.
   */
  'Diagonal',

  /** Buy a call and then buy a put at a higher strike price, Sell a call and then sell a put at higher strike price (1:1 ratio) */
  'Gut',

  /** Two overlapping vertical spreads. One of the verticals is on the call side and one is on the put side */
  'IronButterfly',

  /** A combined put and call spread with same expiration but varying different strikes */
  'IronCondor',

  /** One leg is an OTM put, the other leg is an OTM call */
  'RiskReversal',

  /** A position in both a call and a put with the same underlier, strike price and maturity expiration date */
  'Straddle',

  /** A position in both a call and put with different strike prices but with the same maturity and underlier */
  'Strangle',

  /** Buy a call, sell a put at the same strike. Sell a call, buy a put at the same strike (1:1 ratio) */
  'Synthetic',

  /** A vertical spread has two legs. One is buy and one is sell with same expiration date, but with different strike prices */
  'Vertical',
])
