import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type AccountSubType = GuardType<typeof AccountSubType>

export const AccountSubType = enums([
  /** Equity Saving Account. */
  'EquitySaving',

  /** Error */
  'Error',

  /** Default, used for None. */
  'None',

  /** Norway ASK (Tax saving Account). */
  'NorwayASK',

  /** PEA. */
  'PEA',

  /** PEA-PME. */
  'PEA_PME',

  /** Sweden ISK ( Tax Saving Account). */
  'SwedenISK',

  /** UK ISA account (Tax Saving Account) */
  'UKISA',
])
