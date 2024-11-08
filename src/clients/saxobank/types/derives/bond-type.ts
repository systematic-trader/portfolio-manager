import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type BondType = GuardType<typeof BondType>

export const BondType = enums([
  /** Convertible Bond */
  'Convertible',

  /** DualCurrency Bond */
  'DualCurrency',

  /** FloatingRateNote Bond */
  'FloatingRateNote',

  /** Inflation Linked Bond */
  'InflationLinked',

  /** Non Inflation Linked Bond */
  'NonInflationLinked',

  /** Perpetual Bond */
  'Perpetual',
])
