import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type ShortTrading = GuardType<typeof ShortTrading>

export const ShortTrading = enums([
  /** Short trading is possible for instrument */
  'Allowed',

  /** Short trading is not possible for instrument */
  'NotAllowed',
])
