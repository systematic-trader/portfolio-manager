import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type TaxRegimeType = GuardType<typeof TaxRegimeType>

export const TaxRegimeType = enums([
  'Administered',
  'Declarative',
  'Unspecified',
])
