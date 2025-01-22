import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const SpreadType = enums([
  /** Spread is a target spread */
  'Target',

  /** Spread is variable */
  'Variable',
])

export type SpreadType = GuardType<typeof SpreadType>
