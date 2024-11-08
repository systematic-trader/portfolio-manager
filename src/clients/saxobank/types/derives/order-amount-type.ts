import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type OrderAmountType = GuardType<typeof OrderAmountType>

export const OrderAmountType = enums([
  /** Order amount is specified as a monetary value */
  'CashAmount',

  /**
   * Default.
   * Order Amount is specified as an amount of lots/shares/contracts.
   */
  'Quantity',
])
