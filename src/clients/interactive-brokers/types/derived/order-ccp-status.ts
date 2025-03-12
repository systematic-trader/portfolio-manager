import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const OrderCCPStatus = enums([
  'Cancelled',
  'Filled',
  'Partially Filled',
  'Pending Submit',
  'Submitted',
])

export type OrderCCPStatus = GuardType<typeof OrderCCPStatus>
