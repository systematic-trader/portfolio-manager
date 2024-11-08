import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type LotSizeType = GuardType<typeof LotSizeType>

export const LotSizeType = enums([
  /** Lot size should be respected = for buy only */
  'BuyOnly',

  /** Lot size not used */
  'NotUsed',

  /** Lot size should be respected = odd lot support support exist */
  'OddLotsAllowed',

  /** Lot size must be respected = no odd lot support */
  'OddLotsNotAllowed',
])
