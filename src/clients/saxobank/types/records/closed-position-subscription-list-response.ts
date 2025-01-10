import type { GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { subscriptionListResponseGuard } from '../subscription-list-response.ts'
import { ClosedPositionResponseUnion } from './closed-position-response.ts'

export const ClosedPositionSubscriptionListResponse = subscriptionListResponseGuard(
  ClosedPositionResponseUnion,
)

export interface ClosedPositionSubscriptionListResponse
  extends GuardType<typeof ClosedPositionSubscriptionListResponse> {}
