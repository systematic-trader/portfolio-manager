import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type EntitlementFieldSet = GuardType<typeof EntitlementFieldSet>

export const EntitlementFieldSet = enums([
  /** Return the AssetTypes in the Entitlements array where user has real time access on prices */
  'Default',

  /** Return the AssetTypes in the Entitlements array where user has real time and delayed access on prices */
  'IncludeDelayed',
])
