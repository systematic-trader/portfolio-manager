import type { GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { enums } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const ChartPeriodValues = [
  '*',
  '1m',
  '1min',
  '2min',
  '3min',
  '5min',
  '10min',
  '15min',
  '30min',
  '1h',
  '2h',
  '3h',
  '4h',
  '8h',
  '1d',
  '1w',
] as const

export const ChartPeriod = enums(ChartPeriodValues)

export type ChartPeriod = GuardType<typeof ChartPeriod>
