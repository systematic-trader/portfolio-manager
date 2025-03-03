import type { GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { enums } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const AssetClassValues = [
  'BILL',
  'BND',
  'BOND',
  'CASH',
  'CFD',
  'COMB',
  'CRYPTO',
  'FND',
  'FOP',
  'FUND',
  'FUT',
  'ICS',
  'MRGN',
  'OPT',
  'STK',
  'SWP',
  'WAR',
] as const

export const AssetClass = enums(AssetClassValues)

export type AssetClass = GuardType<typeof AssetClass>
