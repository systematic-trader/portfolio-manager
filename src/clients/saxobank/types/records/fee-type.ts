import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const FeeType = enums([
  /** Absolute fee value */
  'Absolute',

  /** Per action fee value. */
  'PerAction',

  /** Percentage fee value. */
  'Percentage',

  /** Per lot fee value. */
  'PerLot',
])

export type FeeType = GuardType<typeof FeeType>
