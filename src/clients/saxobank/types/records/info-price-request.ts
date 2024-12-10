import {
  enums,
  integer,
  literal,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { extractKeys } from '../../../../utils/object.ts'
import { PutCall } from '../derives/put-call.ts'
import { ToOpenClose } from '../derives/to-open-close.ts'
import { InfoPriceResponse } from './info-price-response.ts'
import type { GuardType } from './position-response.ts'

const BaseRequest = props({
  AssetType: enums(extractKeys(InfoPriceResponse)),
  AccountKey: optional(string()),
  Uic: integer(),
  Amount: optional(number()),
  ToOpenClose: optional(ToOpenClose),
})

export const InfoPriceRequestBond = BaseRequest.merge({
  AssetType: literal('Bond'),
})

export interface InfoPriceRequestBond extends GuardType<typeof InfoPriceRequestBond> {}

export const InfoPriceRequestCfdOnIndex = BaseRequest.merge({
  AssetType: literal('CfdOnIndex'),
})

export interface InfoPriceRequestCfdOnIndex extends GuardType<typeof InfoPriceRequestCfdOnIndex> {}

export const InfoPriceRequestCompanyWarrant = BaseRequest.merge({
  AssetType: literal('CompanyWarrant'),
})

export interface InfoPriceRequestCompanyWarrant extends GuardType<typeof InfoPriceRequestCompanyWarrant> {}

export const InfoPriceRequestCfdOnCompanyWarrant = BaseRequest.merge({
  AssetType: literal('CfdOnCompanyWarrant'),
})

export interface InfoPriceRequestCfdOnCompanyWarrant extends GuardType<typeof InfoPriceRequestCfdOnCompanyWarrant> {}

export const InfoPriceRequestStock = BaseRequest.merge({
  AssetType: literal('Stock'),
})

export interface InfoPriceRequestStock extends GuardType<typeof InfoPriceRequestStock> {}

export const InfoPriceRequestCfdOnStock = BaseRequest.merge({
  AssetType: literal('CfdOnStock'),
})

export interface InfoPriceRequestCfdOnStock extends GuardType<typeof InfoPriceRequestCfdOnStock> {}

export const InfoPriceRequestStockIndexOption = BaseRequest.merge({
  AssetType: literal('StockIndexOption'),
})

export interface InfoPriceRequestStockIndexOption extends GuardType<typeof InfoPriceRequestStockIndexOption> {}

export const InfoPriceRequestStockOption = BaseRequest.merge({
  AssetType: literal('StockOption'),
})

export interface InfoPriceRequestStockOption extends GuardType<typeof InfoPriceRequestStockOption> {}

export const InfoPriceRequestContractFutures = BaseRequest.merge({
  AssetType: literal('ContractFutures'),
})

export interface InfoPriceRequestContractFutures extends GuardType<typeof InfoPriceRequestContractFutures> {}

export const InfoPriceRequestCfdOnFutures = BaseRequest.merge({
  AssetType: literal('CfdOnFutures'),
})

export interface InfoPriceRequestCfdOnFutures extends GuardType<typeof InfoPriceRequestCfdOnFutures> {}

export const InfoPriceRequestEtc = BaseRequest.merge({
  AssetType: literal('Etc'),
})

export interface InfoPriceRequestEtc extends GuardType<typeof InfoPriceRequestEtc> {}

export const InfoPriceRequestCfdOnEtc = BaseRequest.merge({
  AssetType: literal('CfdOnEtc'),
})

export interface InfoPriceRequestCfdOnEtc extends GuardType<typeof InfoPriceRequestCfdOnEtc> {}

export const InfoPriceRequestEtf = BaseRequest.merge({
  AssetType: literal('Etf'),
})

export interface InfoPriceRequestEtf extends GuardType<typeof InfoPriceRequestEtf> {}

export const InfoPriceRequestCfdOnEtf = BaseRequest.merge({
  AssetType: literal('CfdOnEtf'),
})

export interface InfoPriceRequestCfdOnEtf extends GuardType<typeof InfoPriceRequestCfdOnEtf> {}

export const InfoPriceRequestEtn = BaseRequest.merge({
  AssetType: literal('Etn'),
})

export interface InfoPriceRequestEtn extends GuardType<typeof InfoPriceRequestEtn> {}

export const InfoPriceRequestCfdOnEtn = BaseRequest.merge({
  AssetType: literal('CfdOnEtn'),
})

export interface InfoPriceRequestCfdOnEtn extends GuardType<typeof InfoPriceRequestCfdOnEtn> {}

export const InfoPriceRequestFund = BaseRequest.merge({
  AssetType: literal('Fund'),
})

export interface InfoPriceRequestFund extends GuardType<typeof InfoPriceRequestFund> {}

export const InfoPriceRequestCfdOnFund = BaseRequest.merge({
  AssetType: literal('CfdOnFund'),
})

export interface InfoPriceRequestCfdOnFund extends GuardType<typeof InfoPriceRequestCfdOnFund> {}

export const InfoPriceRequestFuturesOption = BaseRequest.merge({
  AssetType: literal('FuturesOption'),
})

export interface InfoPriceRequestFuturesOption extends GuardType<typeof InfoPriceRequestFuturesOption> {}

export const InfoPriceRequestFxForwards = BaseRequest.merge({
  AssetType: literal('FxForwards'),
  ForwardDate: optional(string({ format: 'date-iso8601' })),
})

export interface InfoPriceRequestFxForwards extends GuardType<typeof InfoPriceRequestFxForwards> {}

export const InfoPriceRequestFxNoTouchOption = BaseRequest.merge({
  AssetType: literal('FxNoTouchOption'),
  ExpiryDate: string({ format: 'date-iso8601' }),
  LowerBarrier: optional(number()),
  UpperBarrier: optional(number()),
})

export interface InfoPriceRequestFxNoTouchOption extends GuardType<typeof InfoPriceRequestFxNoTouchOption> {}

export const InfoPriceRequestFxOneTouchOption = BaseRequest.merge({
  AssetType: literal('FxOneTouchOption'),
  ExpiryDate: string({ format: 'date-iso8601' }),
  LowerBarrier: optional(number()),
  UpperBarrier: optional(number()),
})

export interface InfoPriceRequestFxOneTouchOption extends GuardType<typeof InfoPriceRequestFxOneTouchOption> {}

export const InfoPriceRequestFxSpot = BaseRequest.merge({
  AssetType: literal('FxSpot'),
})

export interface InfoPriceRequestFxSpot extends GuardType<typeof InfoPriceRequestFxSpot> {}

export const InfoPriceRequestFxSwap = BaseRequest.merge({
  AssetType: literal('FxSwap'),
  ForwardDateNearLeg: string({ format: 'date-iso8601' }),
  ForwardDateFarLeg: string({ format: 'date-iso8601' }),
})

export interface InfoPriceRequestFxSwap extends GuardType<typeof InfoPriceRequestFxSwap> {}

export const InfoPriceRequestFxVanillaOption = BaseRequest.merge({
  AssetType: literal('FxVanillaOption'),
  PutCall: PutCall,
  ExpiryDate: string({ format: 'date-iso8601' }),
})

export interface InfoPriceRequestFxVanillaOption extends GuardType<typeof InfoPriceRequestFxVanillaOption> {}

export const InfoPriceRequestRights = BaseRequest.merge({
  AssetType: literal('Rights'),
})

export interface InfoPriceRequestRights extends GuardType<typeof InfoPriceRequestRights> {}

export const InfoPriceRequestCfdOnRights = BaseRequest.merge({
  AssetType: literal('CfdOnRights'),
})

export interface InfoPriceRequestCfdOnRights extends GuardType<typeof InfoPriceRequestCfdOnRights> {}

export const InfoPriceRequest = {
  Bond: InfoPriceRequestBond,
  CfdOnIndex: InfoPriceRequestCfdOnIndex,
  CompanyWarrant: InfoPriceRequestCompanyWarrant,
  CfdOnCompanyWarrant: InfoPriceRequestCfdOnCompanyWarrant,
  Stock: InfoPriceRequestStock,
  CfdOnStock: InfoPriceRequestCfdOnStock,
  StockIndexOption: InfoPriceRequestStockIndexOption,
  StockOption: InfoPriceRequestStockOption,
  ContractFutures: InfoPriceRequestContractFutures,
  CfdOnFutures: InfoPriceRequestCfdOnFutures,
  Etc: InfoPriceRequestEtc,
  CfdOnEtc: InfoPriceRequestCfdOnEtc,
  Etf: InfoPriceRequestEtf,
  CfdOnEtf: InfoPriceRequestCfdOnEtf,
  Etn: InfoPriceRequestEtn,
  CfdOnEtn: InfoPriceRequestCfdOnEtn,
  Fund: InfoPriceRequestFund,
  CfdOnFund: InfoPriceRequestCfdOnFund,
  FuturesOption: InfoPriceRequestFuturesOption,
  FxForwards: InfoPriceRequestFxForwards,
  FxNoTouchOption: InfoPriceRequestFxNoTouchOption,
  FxOneTouchOption: InfoPriceRequestFxOneTouchOption,
  FxSpot: InfoPriceRequestFxSpot,
  FxSwap: InfoPriceRequestFxSwap,
  FxVanillaOption: InfoPriceRequestFxVanillaOption,
  Rights: InfoPriceRequestRights,
  CfdOnRights: InfoPriceRequestCfdOnRights,
}

export type InfoPriceRequest = {
  Bond: InfoPriceRequestBond
  CfdOnIndex: InfoPriceRequestCfdOnIndex
  CompanyWarrant: InfoPriceRequestCompanyWarrant
  CfdOnCompanyWarrant: InfoPriceRequestCfdOnCompanyWarrant
  Stock: InfoPriceRequestStock
  CfdOnStock: InfoPriceRequestCfdOnStock
  StockIndexOption: InfoPriceRequestStockIndexOption
  StockOption: InfoPriceRequestStockOption
  ContractFutures: InfoPriceRequestContractFutures
  CfdOnFutures: InfoPriceRequestCfdOnFutures
  Etc: InfoPriceRequestEtc
  CfdOnEtc: InfoPriceRequestCfdOnEtc
  Etf: InfoPriceRequestEtf
  CfdOnEtf: InfoPriceRequestCfdOnEtf
  Etn: InfoPriceRequestEtn
  CfdOnEtn: InfoPriceRequestCfdOnEtn
  Fund: InfoPriceRequestFund
  CfdOnFund: InfoPriceRequestCfdOnFund
  FuturesOption: InfoPriceRequestFuturesOption
  FxForwards: InfoPriceRequestFxForwards
  FxNoTouchOption: InfoPriceRequestFxNoTouchOption
  FxOneTouchOption: InfoPriceRequestFxOneTouchOption
  FxSpot: InfoPriceRequestFxSpot
  FxSwap: InfoPriceRequestFxSwap
  FxVanillaOption: InfoPriceRequestFxVanillaOption
  Rights: InfoPriceRequestRights
  CfdOnRights: InfoPriceRequestCfdOnRights
}
