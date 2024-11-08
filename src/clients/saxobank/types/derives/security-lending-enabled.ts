import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type SecurityLendingEnabled = GuardType<typeof SecurityLendingEnabled>

export const SecurityLendingEnabled = enums([
  /** Security Lending is disabled */
  'No',

  /** Security Lending is enabled */
  'Yes',
])
