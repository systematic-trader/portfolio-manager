import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const OrderSide = enums([
  'BUY',
  'SELL',
])

export type OrderSide = GuardType<typeof OrderSide>
