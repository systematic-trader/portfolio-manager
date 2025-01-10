import type { GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { subscriptionListResponseGuard } from '../subscription-list-response.ts'
import { ClosedPositionResponseUnion } from './position-response.ts'

export const PositionSubscriptionListResponse = subscriptionListResponseGuard(ClosedPositionResponseUnion)

export interface PositionSubscriptionListResponse extends GuardType<typeof PositionSubscriptionListResponse> {}
