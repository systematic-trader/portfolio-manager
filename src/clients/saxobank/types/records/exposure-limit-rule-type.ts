import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const ExposureLimitRuleType = enums([
  /** Amount type */
  'Amount',

  /** Percentage type */
  'Percentage',

  /** Value type */
  'Value',
])

export type ExposureLimitRuleType = GuardType<typeof ExposureLimitRuleType>
