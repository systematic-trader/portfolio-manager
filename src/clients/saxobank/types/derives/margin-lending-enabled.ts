import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type MarginLendingEnabled = GuardType<typeof MarginLendingEnabled>

export const MarginLendingEnabled = enums([
  /** Margin Lending is disabled */
  'No',

  /**
   * Default.
   * Margin Lending is not applicable.
   */
  'None',

  /** Margin Lending is enabled */
  'Yes',
])
