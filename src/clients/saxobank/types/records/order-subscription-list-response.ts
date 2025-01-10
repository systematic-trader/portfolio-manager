import type { GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { subscriptionListResponseGuard } from '../subscription-list-response.ts'
import { OrderResponseUnion } from './order-response.ts'

export const OrderSubscriptionListResponse = subscriptionListResponseGuard(OrderResponseUnion)

export interface OrderSubscriptionListResponse extends GuardType<typeof OrderSubscriptionListResponse> {}
