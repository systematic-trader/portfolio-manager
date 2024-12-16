import type { GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { createSubscriptionResponseGuard } from '../create-subscription-response-guard.ts'
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

export const PriceSubscriptionResponseBond = createSubscriptionResponseGuard(PriceResponseBond)
export interface PriceSubscriptionResponseBond extends GuardType<typeof PriceSubscriptionResponseBond> {}

export const PriceSubscriptionResponseCfdOnEtc = createSubscriptionResponseGuard(PriceResponseCfdOnEtc)
export interface PriceSubscriptionResponseCfdOnEtc extends GuardType<typeof PriceSubscriptionResponseCfdOnEtc> {}

export const PriceSubscriptionResponseCfdOnEtf = createSubscriptionResponseGuard(PriceResponseCfdOnEtf)
export interface PriceSubscriptionResponseCfdOnEtf extends GuardType<typeof PriceSubscriptionResponseCfdOnEtf> {}

export const PriceSubscriptionResponseCfdOnEtn = createSubscriptionResponseGuard(PriceResponseCfdOnEtn)
export interface PriceSubscriptionResponseCfdOnEtn extends GuardType<typeof PriceSubscriptionResponseCfdOnEtn> {}

export const PriceSubscriptionResponseCfdOnFund = createSubscriptionResponseGuard(PriceResponseCfdOnFund)
export interface PriceSubscriptionResponseCfdOnFund extends GuardType<typeof PriceSubscriptionResponseCfdOnFund> {}

export const PriceSubscriptionResponseCfdOnFutures = createSubscriptionResponseGuard(PriceResponseCfdOnFutures)
export interface PriceSubscriptionResponseCfdOnFutures
  extends GuardType<typeof PriceSubscriptionResponseCfdOnFutures> {}

export const PriceSubscriptionResponseCfdOnIndex = createSubscriptionResponseGuard(PriceResponseCfdOnIndex)
export interface PriceSubscriptionResponseCfdOnIndex extends GuardType<typeof PriceSubscriptionResponseCfdOnIndex> {}

export const PriceSubscriptionResponseCfdOnStock = createSubscriptionResponseGuard(PriceResponseCfdOnStock)
export interface PriceSubscriptionResponseCfdOnStock extends GuardType<typeof PriceSubscriptionResponseCfdOnStock> {}

export const PriceSubscriptionResponseContractFutures = createSubscriptionResponseGuard(PriceResponseContractFutures)
export interface PriceSubscriptionResponseContractFutures
  extends GuardType<typeof PriceSubscriptionResponseContractFutures> {}

export const PriceSubscriptionResponseEtc = createSubscriptionResponseGuard(PriceResponseEtc)
export interface PriceSubscriptionResponseEtc extends GuardType<typeof PriceSubscriptionResponseEtc> {}

export const PriceSubscriptionResponseEtf = createSubscriptionResponseGuard(PriceResponseEtf)
export interface PriceSubscriptionResponseEtf extends GuardType<typeof PriceSubscriptionResponseEtf> {}

export const PriceSubscriptionResponseEtn = createSubscriptionResponseGuard(PriceResponseEtn)
export interface PriceSubscriptionResponseEtn extends GuardType<typeof PriceSubscriptionResponseEtn> {}

export const PriceSubscriptionResponseFund = createSubscriptionResponseGuard(PriceResponseFund)
export interface PriceSubscriptionResponseFund extends GuardType<typeof PriceSubscriptionResponseFund> {}

export const PriceSubscriptionResponseFxForwards = createSubscriptionResponseGuard(PriceResponseFxForwards)
export interface PriceSubscriptionResponseFxForwards extends GuardType<typeof PriceSubscriptionResponseFxForwards> {}

export const PriceSubscriptionResponseFxSpot = createSubscriptionResponseGuard(PriceResponseFxSpot)
export interface PriceSubscriptionResponseFxSpot extends GuardType<typeof PriceSubscriptionResponseFxSpot> {}

export const PriceSubscriptionResponseStock = createSubscriptionResponseGuard(PriceResponseStock)
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
