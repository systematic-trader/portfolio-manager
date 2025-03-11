import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const OrderCPPStatus = enums([
  'Pending Submit',
  'Submitted',
])

export type OrderCPPStatus = GuardType<typeof OrderCPPStatus>
