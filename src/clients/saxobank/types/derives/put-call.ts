import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type PutCall = GuardType<typeof PutCall>

export const PutCall = enums([
  /** Call */
  'Call',

  /** Not specified */
  'None',

  /** Put */
  'Put',
])
