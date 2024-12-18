import type { GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { createSubscriptionResponseGuard } from '../create-subscription-response-guard.ts'
import { BalanceResponse } from './balance-response.ts'

export const BalanceSubscriptionResponse = createSubscriptionResponseGuard(BalanceResponse)

export interface BalanceSubscriptionResponse extends GuardType<typeof BalanceSubscriptionResponse> {}
