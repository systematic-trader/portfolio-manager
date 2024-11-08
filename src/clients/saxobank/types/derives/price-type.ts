import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type PriceType = GuardType<typeof PriceType>

export const PriceType = enums([
  /** Best offer from seller (offer price) */
  'Ask',

  /** Highest price from buyer */
  'Bid',

  /**
   * Official price of instrument at the end of trading session.
   */
  'Close',

  /** Highest traded price in period */
  'High',

  /**
   * Best estimate price based on market conditions.
   * Used mainly in low liquidity markets, where Bid/Ask/LastTraded/Close may not be available.
   */
  'Indicative',

  /** Price at which instrument was last traded */
  'LastTraded',

  /** Lowest traded price in period */
  'Low',

  /**
   * The price between the best price of the sellers (bid) and best offer from the buyers (ask).
   */
  'Mid',

  /** Unknown/No value set */
  'None',

  /**
   * Official price of instrument at the start of trading session.
   */
  'Open',

  /** Computed price of instrument */
  'Synthetic',
])
