import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type TenorUnit = GuardType<typeof TenorUnit>

export const TenorUnit = enums([
  /** Days */
  'Days',

  /** Months */
  'Months',

  /** Weeks */
  'Weeks',

  /** Years */
  'Years',
])
