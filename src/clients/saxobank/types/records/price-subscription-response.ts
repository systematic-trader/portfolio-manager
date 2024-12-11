import type { GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { subscriptionResponseGuard } from '../subscription-response.ts'
import {
  PriceResponseBond,
  PriceResponseCfdOnEtc,
  PriceResponseCfdOnEtf,
  PriceResponseCfdOnEtn,
  PriceResponseCfdOnFund,
  PriceResponseCfdOnFutures,
  PriceResponseCfdOnIndex,
  PriceResponseCfdOnStock,
  PriceResponseContractFutures,
  PriceResponseEtc,
  PriceResponseEtf,
  PriceResponseEtn,
  PriceResponseFund,
  PriceResponseFxForwards,
  PriceResponseFxSpot,
  PriceResponseStock,
} from './price-response.ts'

export const PriceSubscriptionResponseBond = subscriptionResponseGuard(PriceResponseBond)
export interface PriceSubscriptionResponseBond extends GuardType<typeof PriceSubscriptionResponseBond> {}

export const PriceSubscriptionResponseCfdOnEtc = subscriptionResponseGuard(PriceResponseCfdOnEtc)
export interface PriceSubscriptionResponseCfdOnEtc extends GuardType<typeof PriceSubscriptionResponseCfdOnEtc> {}

export const PriceSubscriptionResponseCfdOnEtf = subscriptionResponseGuard(PriceResponseCfdOnEtf)
export interface PriceSubscriptionResponseCfdOnEtf extends GuardType<typeof PriceSubscriptionResponseCfdOnEtf> {}

export const PriceSubscriptionResponseCfdOnEtn = subscriptionResponseGuard(PriceResponseCfdOnEtn)
export interface PriceSubscriptionResponseCfdOnEtn extends GuardType<typeof PriceSubscriptionResponseCfdOnEtn> {}

export const PriceSubscriptionResponseCfdOnFund = subscriptionResponseGuard(PriceResponseCfdOnFund)
export interface PriceSubscriptionResponseCfdOnFund extends GuardType<typeof PriceSubscriptionResponseCfdOnFund> {}

export const PriceSubscriptionResponseCfdOnFutures = subscriptionResponseGuard(PriceResponseCfdOnFutures)
export interface PriceSubscriptionResponseCfdOnFutures
  extends GuardType<typeof PriceSubscriptionResponseCfdOnFutures> {}

export const PriceSubscriptionResponseCfdOnIndex = subscriptionResponseGuard(PriceResponseCfdOnIndex)
export interface PriceSubscriptionResponseCfdOnIndex extends GuardType<typeof PriceSubscriptionResponseCfdOnIndex> {}

export const PriceSubscriptionResponseCfdOnStock = subscriptionResponseGuard(PriceResponseCfdOnStock)
export interface PriceSubscriptionResponseCfdOnStock extends GuardType<typeof PriceSubscriptionResponseCfdOnStock> {}

export const PriceSubscriptionResponseContractFutures = subscriptionResponseGuard(PriceResponseContractFutures)
export interface PriceSubscriptionResponseContractFutures
  extends GuardType<typeof PriceSubscriptionResponseContractFutures> {}

export const PriceSubscriptionResponseEtc = subscriptionResponseGuard(PriceResponseEtc)
export interface PriceSubscriptionResponseEtc extends GuardType<typeof PriceSubscriptionResponseEtc> {}

export const PriceSubscriptionResponseEtf = subscriptionResponseGuard(PriceResponseEtf)
export interface PriceSubscriptionResponseEtf extends GuardType<typeof PriceSubscriptionResponseEtf> {}

export const PriceSubscriptionResponseEtn = subscriptionResponseGuard(PriceResponseEtn)
export interface PriceSubscriptionResponseEtn extends GuardType<typeof PriceSubscriptionResponseEtn> {}

export const PriceSubscriptionResponseFund = subscriptionResponseGuard(PriceResponseFund)
export interface PriceSubscriptionResponseFund extends GuardType<typeof PriceSubscriptionResponseFund> {}

export const PriceSubscriptionResponseFxForwards = subscriptionResponseGuard(PriceResponseFxForwards)
export interface PriceSubscriptionResponseFxForwards extends GuardType<typeof PriceSubscriptionResponseFxForwards> {}

export const PriceSubscriptionResponseFxSpot = subscriptionResponseGuard(PriceResponseFxSpot)
export interface PriceSubscriptionResponseFxSpot extends GuardType<typeof PriceSubscriptionResponseFxSpot> {}

export const PriceSubscriptionResponseStock = subscriptionResponseGuard(PriceResponseStock)
export interface PriceSubscriptionResponseStock extends GuardType<typeof PriceSubscriptionResponseStock> {}

export const PriceSubscriptionResponse = {
  Bond: PriceSubscriptionResponseBond,
  CfdOnEtc: PriceSubscriptionResponseCfdOnEtc,
  CfdOnEtf: PriceSubscriptionResponseCfdOnEtf,
  CfdOnEtn: PriceSubscriptionResponseCfdOnEtn,
  CfdOnFund: PriceSubscriptionResponseCfdOnFund,
  CfdOnFutures: PriceSubscriptionResponseCfdOnFutures,
  CfdOnIndex: PriceSubscriptionResponseCfdOnIndex,
  CfdOnStock: PriceSubscriptionResponseCfdOnStock,
  ContractFutures: PriceSubscriptionResponseContractFutures,
  Etc: PriceSubscriptionResponseEtc,
  Etf: PriceSubscriptionResponseEtf,
  Etn: PriceSubscriptionResponseEtn,
  Fund: PriceSubscriptionResponseFund,
  FxForwards: PriceSubscriptionResponseFxForwards,
  FxSpot: PriceSubscriptionResponseFxSpot,
  Stock: PriceSubscriptionResponseStock,
} as const

export interface PriceSubscriptionResponse {
  Bond: PriceSubscriptionResponseBond
  CfdOnEtc: PriceSubscriptionResponseCfdOnEtc
  CfdOnEtf: PriceSubscriptionResponseCfdOnEtf
  CfdOnEtn: PriceSubscriptionResponseCfdOnEtn
  CfdOnFund: PriceSubscriptionResponseCfdOnFund
  CfdOnFutures: PriceSubscriptionResponseCfdOnFutures
  CfdOnIndex: PriceSubscriptionResponseCfdOnIndex
  CfdOnStock: PriceSubscriptionResponseCfdOnStock
  ContractFutures: PriceSubscriptionResponseContractFutures
  Etc: PriceSubscriptionResponseEtc
  Etf: PriceSubscriptionResponseEtf
  Etn: PriceSubscriptionResponseEtn
  Fund: PriceSubscriptionResponseFund
  FxForwards: PriceSubscriptionResponseFxForwards
  FxSpot: PriceSubscriptionResponseFxSpot
  Stock: PriceSubscriptionResponseStock
}
