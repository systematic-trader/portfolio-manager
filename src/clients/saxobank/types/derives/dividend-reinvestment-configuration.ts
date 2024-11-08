import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type DividendReinvestmentConfiguration = GuardType<typeof DividendReinvestmentConfiguration>

export const DividendReinvestmentConfiguration = enums([
  /** Dividend reinvestment is handled by Euronext Securities for the DK markets (formerly known as VP Securities) */
  'EuronextSecuritiesDK',
])
