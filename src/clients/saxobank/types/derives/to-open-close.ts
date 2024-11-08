import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type ToOpenClose = GuardType<typeof ToOpenClose>

export const ToOpenClose = enums([
  /** Order/Position is ToClose */
  'ToClose',

  /** Order/Position is ToOpen */
  'ToOpen',
])
