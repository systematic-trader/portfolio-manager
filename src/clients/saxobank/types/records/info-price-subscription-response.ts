import {
  array,
  type GuardType,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { createSubscriptionResponseGuard } from '../create-subscription-response-guard.ts'
import {
  InfoPriceResponseBond,
  InfoPriceResponseCfdOnEtc,
  InfoPriceResponseCfdOnEtf,
  InfoPriceResponseCfdOnEtn,
  InfoPriceResponseCfdOnFund,
  InfoPriceResponseCfdOnFutures,
  InfoPriceResponseCfdOnIndex,
  InfoPriceResponseCfdOnStock,
  InfoPriceResponseContractFutures,
  InfoPriceResponseEtc,
  InfoPriceResponseEtf,
  InfoPriceResponseEtn,
  InfoPriceResponseFund,
  InfoPriceResponseFxForwards,
  InfoPriceResponseFxSpot,
  InfoPriceResponseStock,
} from './info-price-response.ts'

export const InfoPriceSubscriptionResponseBond = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseBond),
}))
export interface InfoPriceSubscriptionResponseBond extends GuardType<typeof InfoPriceSubscriptionResponseBond> {}

export const InfoPriceSubscriptionResponseCfdOnEtc = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseCfdOnEtc),
}))
export interface InfoPriceSubscriptionResponseCfdOnEtc
  extends GuardType<typeof InfoPriceSubscriptionResponseCfdOnEtc> {}

export const InfoPriceSubscriptionResponseCfdOnEtf = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseCfdOnEtf),
}))
export interface InfoPriceSubscriptionResponseCfdOnEtf
  extends GuardType<typeof InfoPriceSubscriptionResponseCfdOnEtf> {}

export const InfoPriceSubscriptionResponseCfdOnEtn = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseCfdOnEtn),
}))
export interface InfoPriceSubscriptionResponseCfdOnEtn
  extends GuardType<typeof InfoPriceSubscriptionResponseCfdOnEtn> {}

export const InfoPriceSubscriptionResponseCfdOnFund = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseCfdOnFund),
}))
export interface InfoPriceSubscriptionResponseCfdOnFund
  extends GuardType<typeof InfoPriceSubscriptionResponseCfdOnFund> {}

export const InfoPriceSubscriptionResponseCfdOnFutures = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseCfdOnFutures),
}))
export interface InfoPriceSubscriptionResponseCfdOnFutures
  extends GuardType<typeof InfoPriceSubscriptionResponseCfdOnFutures> {}

export const InfoPriceSubscriptionResponseCfdOnIndex = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseCfdOnIndex),
}))
export interface InfoPriceSubscriptionResponseCfdOnIndex
  extends GuardType<typeof InfoPriceSubscriptionResponseCfdOnIndex> {}

export const InfoPriceSubscriptionResponseCfdOnStock = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseCfdOnStock),
}))
export interface InfoPriceSubscriptionResponseCfdOnStock
  extends GuardType<typeof InfoPriceSubscriptionResponseCfdOnStock> {}

export const InfoPriceSubscriptionResponseContractFutures = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseContractFutures),
}))
export interface InfoPriceSubscriptionResponseContractFutures
  extends GuardType<typeof InfoPriceSubscriptionResponseContractFutures> {}

export const InfoPriceSubscriptionResponseEtc = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseEtc),
}))
export interface InfoPriceSubscriptionResponseEtc extends GuardType<typeof InfoPriceSubscriptionResponseEtc> {}

export const InfoPriceSubscriptionResponseEtf = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseEtf),
}))
export interface InfoPriceSubscriptionResponseEtf extends GuardType<typeof InfoPriceSubscriptionResponseEtf> {}

export const InfoPriceSubscriptionResponseEtn = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseEtn),
}))
export interface InfoPriceSubscriptionResponseEtn extends GuardType<typeof InfoPriceSubscriptionResponseEtn> {}

export const InfoPriceSubscriptionResponseFund = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseFund),
}))
export interface InfoPriceSubscriptionResponseFund extends GuardType<typeof InfoPriceSubscriptionResponseFund> {}

export const InfoPriceSubscriptionResponseFxForwards = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseFxForwards),
}))
export interface InfoPriceSubscriptionResponseFxForwards
  extends GuardType<typeof InfoPriceSubscriptionResponseFxForwards> {}

export const InfoPriceSubscriptionResponseFxSpot = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseFxSpot),
}))
export interface InfoPriceSubscriptionResponseFxSpot extends GuardType<typeof InfoPriceSubscriptionResponseFxSpot> {}

export const InfoPriceSubscriptionResponseStock = createSubscriptionResponseGuard(props({
  Data: array(InfoPriceResponseStock),
}))
export interface InfoPriceSubscriptionResponseStock extends GuardType<typeof InfoPriceSubscriptionResponseStock> {}

export const InfoPriceSubscriptionResponse = {
  Bond: InfoPriceSubscriptionResponseBond,
  CfdOnEtc: InfoPriceSubscriptionResponseCfdOnEtc,
  CfdOnEtf: InfoPriceSubscriptionResponseCfdOnEtf,
  CfdOnEtn: InfoPriceSubscriptionResponseCfdOnEtn,
  CfdOnFund: InfoPriceSubscriptionResponseCfdOnFund,
  CfdOnFutures: InfoPriceSubscriptionResponseCfdOnFutures,
  CfdOnIndex: InfoPriceSubscriptionResponseCfdOnIndex,
  CfdOnStock: InfoPriceSubscriptionResponseCfdOnStock,
  ContractFutures: InfoPriceSubscriptionResponseContractFutures,
  Etc: InfoPriceSubscriptionResponseEtc,
  Etf: InfoPriceSubscriptionResponseEtf,
  Etn: InfoPriceSubscriptionResponseEtn,
  Fund: InfoPriceSubscriptionResponseFund,
  FxForwards: InfoPriceSubscriptionResponseFxForwards,
  FxSpot: InfoPriceSubscriptionResponseFxSpot,
  Stock: InfoPriceSubscriptionResponseStock,
} as const

export interface InfoPriceSubscriptionResponse {
  Bond: InfoPriceSubscriptionResponseBond
  CfdOnEtc: InfoPriceSubscriptionResponseCfdOnEtc
  CfdOnEtf: InfoPriceSubscriptionResponseCfdOnEtf
  CfdOnEtn: InfoPriceSubscriptionResponseCfdOnEtn
  CfdOnFund: InfoPriceSubscriptionResponseCfdOnFund
  CfdOnFutures: InfoPriceSubscriptionResponseCfdOnFutures
  CfdOnIndex: InfoPriceSubscriptionResponseCfdOnIndex
  CfdOnStock: InfoPriceSubscriptionResponseCfdOnStock
  ContractFutures: InfoPriceSubscriptionResponseContractFutures
  Etc: InfoPriceSubscriptionResponseEtc
  Etf: InfoPriceSubscriptionResponseEtf
  Etn: InfoPriceSubscriptionResponseEtn
  Fund: InfoPriceSubscriptionResponseFund
  FxForwards: InfoPriceSubscriptionResponseFxForwards
  FxSpot: InfoPriceSubscriptionResponseFxSpot
  Stock: InfoPriceSubscriptionResponseStock
}
