import {
  array,
  type GuardType,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Entitlement } from './entitlement.ts'

export interface EntitlementDetails extends GuardType<typeof EntitlementDetails> {}

export const EntitlementDetails = props({
  /** The all client specific entitlements for market data, which the user currently has access to */
  Entitlements: array(Entitlement),

  /** The unique ID of the exchange */
  ExchangeId: string(),
})
