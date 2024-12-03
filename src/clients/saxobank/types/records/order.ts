import {
  type GuardType,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { StringErrorResponse } from './string-error-response.ts'

export interface Order extends GuardType<typeof Order> {}

export const Order = props({
  /** Id of order */
  OrderId: string(),

  /** Contains error info when cancel of order failed */
  ErrorInfo: optional(StringErrorResponse),
})
