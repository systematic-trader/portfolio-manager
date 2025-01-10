import type { GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { subscriptionResponseGuard } from '../subscription-response.ts'
import { BalanceResponse } from './balance-response.ts'

export const BalanceSubscriptionResponse = subscriptionResponseGuard(BalanceResponse)

export interface BalanceSubscriptionResponse extends GuardType<typeof BalanceSubscriptionResponse> {}
