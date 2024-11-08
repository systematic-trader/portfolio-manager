import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type OrderDistanceType = GuardType<typeof OrderDistanceType>

export const OrderDistanceType = enums([
  /** % +/- the current price */
  'Percentage',

  /**
   * +/- the current price.
   * Only applicable to Fx.
   */
  'Pips',

  /**	Absolute price. */
  'Price',
])
