import {
  boolean,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { OrderDurationType } from '../derives/order-duration-type.ts'

export const OrderDuration = union([
  props({
    /**
     * Order duration type.
     * Defines the time period during which an order is valid.
     * If the period expires (for instance for a DayOrder or GoodTillDate order), the order is cancelled automatically.
     */
    DurationType: OrderDurationType.exclude(['GoodTillDate']),
  }),

  props({
    /**
     * Order duration type.
     * Defines the time period during which an order is valid.
     * If the period expires (for instance for a DayOrder or GoodTillDate order), the order is cancelled automatically.
     */
    DurationType: OrderDurationType.extract(['GoodTillDate']),

    /**
     * Indicates whether the ExpirationDateTime field contains the time alongside a date.
     * Only applicable for GoodTillDate OrderDurationType.
     */
    ExpirationDateContainsTime: boolean(),

    /**
     * Expiration date and (optionally) time if the order duration type is GoodTillDate.
     * If no time is provided, orders are cancelled at the end of the trading day during overnight processing.
     * Note: the time value of this field (if provided) is always expressed in the timezone of the exchange on which the instrument is traded.
     *
     * The time value only supports hours and minutes formatted as HH:MM.
     * For instance, a 15:00 expiration time for an instrument traded on NYSE will be cancelled automatically at 3pm local time (NY) if the order is not triggered before this time.
     */
    ExpirationDateTime: string({ format: 'date-iso8601' }),
  }),
])

export type OrderDuration = {
  /**
   * Order duration type.
   * Defines the time period during which an order is valid.
   * If the period expires (for instance for a DayOrder or GoodTillDate order), the order is cancelled automatically.
   */
  readonly DurationType: Exclude<OrderDurationType, 'GoodTillDate'>
} | {
  /**
   * Order duration type.
   * Defines the time period during which an order is valid.
   */
  readonly DurationType: 'GoodTillDate'

  /**
   * Indicates whether the ExpirationDateTime field contains the time alongside a date.
   */
  readonly ExpirationDateContainsTime: boolean

  /**
   * Expiration date and (optionally) time.
   *
   * If no time is provided (i.e. ExpirationDateContainsTime=false), orders are cancelled at the end of the trading day during overnight processing.
   * The time value of this field (if provided) is always expressed in the timezone of the exchange on which the instrument is traded.
   *
   * The time value only supports hours and minutes formatted as HH:MM.
   * For instance, a 15:00 expiration time for an instrument traded on NYSE will be cancelled automatically at 3pm local time (NY) if the order is not triggered before this time.
   *
   * Valid examples for ExpirationDateContainsTime=true
   *  - 2022-01-01
   *  - 2022-01-01T13:00
   *  - 2022-01-01T13:00:00
   *  - 2022-01-01T13:47
   *  - 2022-01-01T13:47:00
   *  - 2022-01-01T13:47:51
   *
   * Valid examples for ExpirationDateContainsTime=false
   *  - 2022-01-01
   *  - 2022-01-01T00:00
   *  - 2022-01-01T00:00:00
   */
  readonly ExpirationDateTime: string
}
