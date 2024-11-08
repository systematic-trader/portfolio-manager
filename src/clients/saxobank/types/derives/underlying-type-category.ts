import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type UnderlyingTypeCategory = GuardType<typeof UnderlyingTypeCategory>

export const UnderlyingTypeCategory = enums([
  /** Instrument has more than one underlying instruments */
  'Basket',

  /** Instrument has one or less underlying instruments */
  'Instrument',
])
