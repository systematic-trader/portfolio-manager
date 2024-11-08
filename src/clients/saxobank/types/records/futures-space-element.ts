import {
  format,
  type GuardType,
  integer,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface FuturesSpaceElement extends GuardType<typeof FuturesSpaceElement> {}

export const FuturesSpaceElement = props({
  /** Number of days until expiry */
  DaysToExpiry: integer(),

  /**
   * Expiry date of the instrument.
   * Futures only.
   */
  ExpiryDate: format('gregorian-date'),

  /** Gets the symbol, which is the unique and global name for the instrument */
  Symbol: string(),

  /**
   * Gets the UIC (Unique Instrument Code.
   * Saxo Bank internal code for instruments)
   */
  Uic: integer(),
})
