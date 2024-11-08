import {
  type GuardType,
  number,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { OrderType } from '../derives/order-type.ts'
import { OrderDuration } from './order-duration.ts'

export interface RelatedOrderInfo extends GuardType<typeof RelatedOrderInfo> {}

export const RelatedOrderInfo = props({
  /** Order size */
  Amount: number(),

  /**
   * The time frame during which the order is valid.
   */
  Duration: OrderDuration,

  /** The order type */
  OpenOrderType: OrderType,

  /** The orderId */
  OrderId: string(),

  /** Price at which the order is triggered */
  OrderPrice: number(),

  /** Stop limit price for stop limit order */
  StopLimitPrice: number(),

  /** Distance to market for a trailing stop order */
  TrailingStopDistanceToMarket: number(),

  /** Step size for trailing stop order */
  TrailingStopStep: number(),
})
