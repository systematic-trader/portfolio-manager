import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const OrderStatus = enums([
  'Cancelled',
  'Filled',
  'Inactive',
  'PreSubmitted',
  'Submitted',
])

export type OrderStatus = GuardType<typeof OrderStatus>
