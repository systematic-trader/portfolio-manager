import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type EntityType = GuardType<typeof EntityType>

export const EntityType = enums([
  /** This describes an optionroot (the basis for exchange tradec contract options) */
  'ContractOptionRoot',

  /** This describes a real instrument */
  'Instrument',
])
