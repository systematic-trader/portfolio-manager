import {
  type GuardType,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { StringErrorResponse } from './string-error-response.ts'

export interface Order extends GuardType<typeof Order> {}

export const Order = props({
  /** Id of order */
  OrderId: string(),

  /**
   * Unique identifier for the multi-leg order.
   * Same for all legs.
   */
  MultiLegOrderId: string(),

  /** Contains error info when cancel of order failed */
  ErrorInfo: StringErrorResponse,
})
