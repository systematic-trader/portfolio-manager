import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const TimeInForce = enums([
  'DAY',
])

export type TimeInForce = GuardType<typeof TimeInForce>
