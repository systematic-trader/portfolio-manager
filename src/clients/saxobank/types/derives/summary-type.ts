import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type SummaryType = GuardType<typeof SummaryType>

export const SummaryType = enums([
  /** This describes a real instrument */
  'Instrument',

  /** This describes an optionroot (the basis for exchange tradec contract options) */
  'ContractOptionRoot',
])
