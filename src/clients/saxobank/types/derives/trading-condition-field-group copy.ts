import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const ScheduledTradingConditionsFieldGroupValues = [
  /** Scheduled Trading Conditions */
  'ScheduledTradingConditions',
] as const

export const ScheduledTradingConditionsFieldGroup = enums(ScheduledTradingConditionsFieldGroupValues)

export type ScheduledTradingConditionsFieldGroup = GuardType<typeof ScheduledTradingConditionsFieldGroup>
