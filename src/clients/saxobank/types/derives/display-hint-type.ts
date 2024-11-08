import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type DisplayHintType = GuardType<typeof DisplayHintType>

export const DisplayHintType = enums([
  /** Used for the parent ContractFutures */
  'Continuous',

  /** CryptoCurrencies */
  'CryptoCurrencies',

  /** Forex. Intended to be used for Cfds on Futures on Forex. */
  'Forex',

  /** Interest rates. Intended to be used for Cfds on Futures on bonds. */
  'Interests',

  /** Indicates not special display hint is required. */
  'None',

  /** Metals like XAUUSD */
  'PreciousMetal',

  /**
   * Stock indices.
   * Intended to be used for Cfds on Futures on stock indices.
   */
  'StockIndices',
])
