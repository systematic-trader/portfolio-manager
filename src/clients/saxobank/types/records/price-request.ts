import {
  integer,
  literal,
  number,
  optional,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ToOpenClose } from '../derives/to-open-close.ts'
import type { GuardType } from './position-response.ts'

const BaseRequest = props({
  AccountKey: optional(string()),
  Uic: integer(),
  Amount: optional(number()),
  ToOpenClose: optional(ToOpenClose),
})

export const PriceRequestBond = BaseRequest.merge({
  AssetType: literal('Bond'),
})

export interface PriceRequestBond extends GuardType<typeof PriceRequestBond> {}

export const PriceRequestCfdOnIndex = BaseRequest.merge({
  AssetType: literal('CfdOnIndex'),
})

export interface PriceRequestCfdOnIndex extends GuardType<typeof PriceRequestCfdOnIndex> {}

export const PriceRequestStock = BaseRequest.merge({
  AssetType: literal('Stock'),
})

export interface PriceRequestStock extends GuardType<typeof PriceRequestStock> {}

export const PriceRequestCfdOnStock = BaseRequest.merge({
  AssetType: literal('CfdOnStock'),
})

export interface PriceRequestCfdOnStock extends GuardType<typeof PriceRequestCfdOnStock> {}

export const PriceRequestContractFutures = BaseRequest.merge({
  AssetType: literal('ContractFutures'),
})

export interface PriceRequestContractFutures extends GuardType<typeof PriceRequestContractFutures> {}

export const PriceRequestCfdOnFutures = BaseRequest.merge({
  AssetType: literal('CfdOnFutures'),
})

export interface PriceRequestCfdOnFutures extends GuardType<typeof PriceRequestCfdOnFutures> {}

export const PriceRequestEtc = BaseRequest.merge({
  AssetType: literal('Etc'),
})

export interface PriceRequestEtc extends GuardType<typeof PriceRequestEtc> {}

export const PriceRequestCfdOnEtc = BaseRequest.merge({
  AssetType: literal('CfdOnEtc'),
})

export interface PriceRequestCfdOnEtc extends GuardType<typeof PriceRequestCfdOnEtc> {}

export const PriceRequestEtf = BaseRequest.merge({
  AssetType: literal('Etf'),
})

export interface PriceRequestEtf extends GuardType<typeof PriceRequestEtf> {}

export const PriceRequestCfdOnEtf = BaseRequest.merge({
  AssetType: literal('CfdOnEtf'),
})

export interface PriceRequestCfdOnEtf extends GuardType<typeof PriceRequestCfdOnEtf> {}

export const PriceRequestEtn = BaseRequest.merge({
  AssetType: literal('Etn'),
})

export interface PriceRequestEtn extends GuardType<typeof PriceRequestEtn> {}

export const PriceRequestCfdOnEtn = BaseRequest.merge({
  AssetType: literal('CfdOnEtn'),
})

export interface PriceRequestCfdOnEtn extends GuardType<typeof PriceRequestCfdOnEtn> {}

export const PriceRequestFund = BaseRequest.merge({
  AssetType: literal('Fund'),
})

export interface PriceRequestFund extends GuardType<typeof PriceRequestFund> {}

export const PriceRequestCfdOnFund = BaseRequest.merge({
  AssetType: literal('CfdOnFund'),
})

export interface PriceRequestCfdOnFund extends GuardType<typeof PriceRequestCfdOnFund> {}

export const PriceRequestFxForwards = BaseRequest.merge({
  AssetType: literal('FxForwards'),
  ForwardDate: optional(string({ format: 'date-iso8601' })),
})

export interface PriceRequestFxForwards extends GuardType<typeof PriceRequestFxForwards> {}

export const PriceRequestFxSpot = BaseRequest.merge({
  AssetType: literal('FxSpot'),
})

export interface PriceRequestFxSpot extends GuardType<typeof PriceRequestFxSpot> {}

export const PriceRequest = {
  Bond: PriceRequestBond,
  CfdOnEtc: PriceRequestCfdOnEtc,
  CfdOnEtf: PriceRequestCfdOnEtf,
  CfdOnEtn: PriceRequestCfdOnEtn,
  CfdOnFund: PriceRequestCfdOnFund,
  CfdOnFutures: PriceRequestCfdOnFutures,
  CfdOnIndex: PriceRequestCfdOnIndex,
  CfdOnStock: PriceRequestCfdOnStock,
  ContractFutures: PriceRequestContractFutures,
  Etc: PriceRequestEtc,
  Etf: PriceRequestEtf,
  Etn: PriceRequestEtn,
  Fund: PriceRequestFund,
  FxForwards: PriceRequestFxForwards,
  FxSpot: PriceRequestFxSpot,
  Stock: PriceRequestStock,
}

export type PriceRequest = {
  Bond: PriceRequestBond
  CfdOnEtc: PriceRequestCfdOnEtc
  CfdOnEtf: PriceRequestCfdOnEtf
  CfdOnEtn: PriceRequestCfdOnEtn
  CfdOnFund: PriceRequestCfdOnFund
  CfdOnFutures: PriceRequestCfdOnFutures
  CfdOnIndex: PriceRequestCfdOnIndex
  CfdOnStock: PriceRequestCfdOnStock
  ContractFutures: PriceRequestContractFutures
  Etc: PriceRequestEtc
  Etf: PriceRequestEtf
  Etn: PriceRequestEtn
  Fund: PriceRequestFund
  FxForwards: PriceRequestFxForwards
  FxSpot: PriceRequestFxSpot
  Stock: PriceRequestStock
}

export const PriceRequestUnion = union([
  PriceRequestBond,
  PriceRequestCfdOnEtc,
  PriceRequestCfdOnEtf,
  PriceRequestCfdOnEtn,
  PriceRequestCfdOnFund,
  PriceRequestCfdOnFutures,
  PriceRequestCfdOnIndex,
  PriceRequestCfdOnStock,
  PriceRequestContractFutures,
  PriceRequestEtc,
  PriceRequestEtf,
  PriceRequestEtn,
  PriceRequestFund,
  PriceRequestFxForwards,
  PriceRequestFxSpot,
  PriceRequestStock,
])

export type PriceRequestUnion = GuardType<typeof PriceRequestUnion>
