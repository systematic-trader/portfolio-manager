import { type GuardType, string } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const Cusip = string({ length: 9, format: 'non-negative-integer' })

export type Cusip = GuardType<typeof Cusip>
