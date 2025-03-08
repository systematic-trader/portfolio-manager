import type { GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { enums } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const AssetClassValues = [
  'BAG',
  'BILL',
  'BND',
  'BOND',
  'CASH',
  'CFD',
  'CMDTY',
  'COMB',
  'CRYPTO',
  'FND',
  'FOP',
  'FUND',
  'FUT',
  'ICS',
  'ICU',
  'IND',
  'IOPT',
  'MRGN',
  'News',
  'OPT',
  'PDC',
  'PHYSS',
  'SLB',
  'STK',
  'SWP',
  'WAR',
] as const

export const AssetClass = enums(AssetClassValues)

export type AssetClass = GuardType<typeof AssetClass>
