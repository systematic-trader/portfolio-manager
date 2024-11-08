import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type AllowedTradingSessions = GuardType<typeof AllowedTradingSessions>

export const AllowedTradingSessions = enums([
  /** Extended trading hours session*/
  'All',

  /**
   * Default value.
   * Regular trading hours session.
   */
  'Regular',
])
