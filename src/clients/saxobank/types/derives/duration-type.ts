import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type DurationType = GuardType<typeof DurationType>

export const DurationType = enums([
  /** Day order */
  'DayOrder',

  /**	Fill or kill */
  'FillOrKill',

  /** Good for period */
  'GoodForPeriod',

  /** Good till cancel */
  'GoodTillCancel',

  /**	Good till date */
  'GoodTillDate',

  /** Immediate or cancel */
  'ImmediateOrCancel',
])
