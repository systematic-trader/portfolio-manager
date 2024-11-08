import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type OrderStatus = GuardType<typeof OrderStatus>

export const OrderStatus = enums([
  /** Filled */
  'Filled',

  /** Locked. Placement pending. */
  'LockedPlacementPending',

  /** Not Working */
  'NotWorking',

  /** Locked. Cancel pending. */
  'NotWorkingLockedCancelPending',

  /** Locked. Change pending. */
  'NotWorkingLockedChangePending',

  /**
   * Parked orders are in inactive state, can't be filled, but remain available in so they can be made active at any time.
   * Clients can manually 'park' and 'activate' an order.
   */
  'Parked',

  /** Unknown */
  'Unknown',

  /** Working */
  'Working',

  /** Working. Locked. Cancel Pending. */
  'WorkingLockedCancelPending',

  /** Working. Locked. Change Pending. */
  'WorkingLockedChangePending',
])
