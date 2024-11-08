import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type OrderStatusFilter = GuardType<typeof OrderStatusFilter>

export const OrderStatusFilter = enums([
  /** Returns all orders regardless of type */
  'All',

  /**
   * Returns only top level orders and OCO orders.
   * Stop/Limit orders details are available in the RelatedOrders properties.
   */
  'Working',
])
