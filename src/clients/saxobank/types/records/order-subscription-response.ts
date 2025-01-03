import {
  array,
  type GuardType,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { createSubscriptionResponseGuard } from '../create-subscription-response-guard.ts'
import { OrderResponseUnion } from './order-response.ts'

export const OrderSubscriptionResponse = createSubscriptionResponseGuard(
  optional(
    props({
      Data: array(OrderResponseUnion),
    }),
  ),
)

export interface OrderSubscriptionResponse extends GuardType<typeof OrderSubscriptionResponse> {}
