import type { GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { enums } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const SecurityTypeValues = [
  'BOND',
  'CASH',
  'CRYPTO',
  'FOP',
  'FUND',
  'FUT',
  'IND',
  'OPT',
  'STK',
  'WAR',
] as const

export const SecurityType = enums(SecurityTypeValues)

export type SecurityType = GuardType<typeof SecurityType>
