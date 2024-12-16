import {
  array,
  enums,
  type GuardType,
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

const BaseRequest = props({
  AssetType: enums(extractKeys(InfoPriceResponse)),
  AccountKey: optional(string()),
  Uics: array(integer()),
  Amount: optional(number()),
  ToOpenClose: optional(ToOpenClose),
})

export const InfoPriceListRequestBond = BaseRequest.merge({
  AssetType: literal('Bond'),
})

export interface InfoPriceListRequestBond extends GuardType<typeof InfoPriceListRequestBond> {}

export const InfoPriceListRequestCfdOnIndex = BaseRequest.merge({
  AssetType: literal('CfdOnIndex'),
})

export interface InfoPriceListRequestCfdOnIndex extends GuardType<typeof InfoPriceListRequestCfdOnIndex> {}

export const InfoPriceListRequestCompanyWarrant = BaseRequest.merge({
  AssetType: literal('CompanyWarrant'),
})

export interface InfoPriceListRequestCompanyWarrant extends GuardType<typeof InfoPriceListRequestCompanyWarrant> {}

export const InfoPriceListRequestCfdOnCompanyWarrant = BaseRequest.merge({
  AssetType: literal('CfdOnCompanyWarrant'),
})

export interface InfoPriceListRequestCfdOnCompanyWarrant
  extends GuardType<typeof InfoPriceListRequestCfdOnCompanyWarrant> {}

export const InfoPriceListRequestStock = BaseRequest.merge({
  AssetType: literal('Stock'),
})

export interface InfoPriceListRequestStock extends GuardType<typeof InfoPriceListRequestStock> {}

export const InfoPriceListRequestCfdOnStock = BaseRequest.merge({
  AssetType: literal('CfdOnStock'),
})

export interface InfoPriceListRequestCfdOnStock extends GuardType<typeof InfoPriceListRequestCfdOnStock> {}

export const InfoPriceListRequestStockIndexOption = BaseRequest.merge({
  AssetType: literal('StockIndexOption'),
})

export interface InfoPriceListRequestStockIndexOption extends GuardType<typeof InfoPriceListRequestStockIndexOption> {}

export const InfoPriceListRequestStockOption = BaseRequest.merge({
  AssetType: literal('StockOption'),
})

export interface InfoPriceListRequestStockOption extends GuardType<typeof InfoPriceListRequestStockOption> {}

export const InfoPriceListRequestContractFutures = BaseRequest.merge({
  AssetType: literal('ContractFutures'),
})

export interface InfoPriceListRequestContractFutures extends GuardType<typeof InfoPriceListRequestContractFutures> {}

export const InfoPriceListRequestCfdOnFutures = BaseRequest.merge({
  AssetType: literal('CfdOnFutures'),
})

export interface InfoPriceListRequestCfdOnFutures extends GuardType<typeof InfoPriceListRequestCfdOnFutures> {}

export const InfoPriceListRequestEtc = BaseRequest.merge({
  AssetType: literal('Etc'),
})

export interface InfoPriceListRequestEtc extends GuardType<typeof InfoPriceListRequestEtc> {}

export const InfoPriceListRequestCfdOnEtc = BaseRequest.merge({
  AssetType: literal('CfdOnEtc'),
})

export interface InfoPriceListRequestCfdOnEtc extends GuardType<typeof InfoPriceListRequestCfdOnEtc> {}

export const InfoPriceListRequestEtf = BaseRequest.merge({
  AssetType: literal('Etf'),
})

export interface InfoPriceListRequestEtf extends GuardType<typeof InfoPriceListRequestEtf> {}

export const InfoPriceListRequestCfdOnEtf = BaseRequest.merge({
  AssetType: literal('CfdOnEtf'),
})

export interface InfoPriceListRequestCfdOnEtf extends GuardType<typeof InfoPriceListRequestCfdOnEtf> {}

export const InfoPriceListRequestEtn = BaseRequest.merge({
  AssetType: literal('Etn'),
})

export interface InfoPriceListRequestEtn extends GuardType<typeof InfoPriceListRequestEtn> {}

export const InfoPriceListRequestCfdOnEtn = BaseRequest.merge({
  AssetType: literal('CfdOnEtn'),
})

export interface InfoPriceListRequestCfdOnEtn extends GuardType<typeof InfoPriceListRequestCfdOnEtn> {}

export const InfoPriceListRequestFund = BaseRequest.merge({
  AssetType: literal('Fund'),
})

export interface InfoPriceListRequestFund extends GuardType<typeof InfoPriceListRequestFund> {}

export const InfoPriceListRequestCfdOnFund = BaseRequest.merge({
  AssetType: literal('CfdOnFund'),
})

export interface InfoPriceListRequestCfdOnFund extends GuardType<typeof InfoPriceListRequestCfdOnFund> {}

export const InfoPriceListRequestFuturesOption = BaseRequest.merge({
  AssetType: literal('FuturesOption'),
})

export interface InfoPriceListRequestFuturesOption extends GuardType<typeof InfoPriceListRequestFuturesOption> {}

export const InfoPriceListRequestFxForwards = BaseRequest.merge({
  AssetType: literal('FxForwards'),
  ForwardDate: optional(string({ format: 'date-iso8601' })),
})

export interface InfoPriceListRequestFxForwards extends GuardType<typeof InfoPriceListRequestFxForwards> {}

export const InfoPriceListRequestFxNoTouchOption = BaseRequest.merge({
  AssetType: literal('FxNoTouchOption'),
  ExpiryDate: string({ format: 'date-iso8601' }),
  LowerBarrier: optional(number()),
  UpperBarrier: optional(number()),
})

export interface InfoPriceListRequestFxNoTouchOption extends GuardType<typeof InfoPriceListRequestFxNoTouchOption> {}

export const InfoPriceListRequestFxOneTouchOption = BaseRequest.merge({
  AssetType: literal('FxOneTouchOption'),
  ExpiryDate: string({ format: 'date-iso8601' }),
  LowerBarrier: optional(number()),
  UpperBarrier: optional(number()),
})

export interface InfoPriceListRequestFxOneTouchOption extends GuardType<typeof InfoPriceListRequestFxOneTouchOption> {}

export const InfoPriceListRequestFxSpot = BaseRequest.merge({
  AssetType: literal('FxSpot'),
})

export interface InfoPriceListRequestFxSpot extends GuardType<typeof InfoPriceListRequestFxSpot> {}

export const InfoPriceListRequestFxSwap = BaseRequest.merge({
  AssetType: literal('FxSwap'),
  ForwardDateNearLeg: string({ format: 'date-iso8601' }),
  ForwardDateFarLeg: string({ format: 'date-iso8601' }),
})

export interface InfoPriceListRequestFxSwap extends GuardType<typeof InfoPriceListRequestFxSwap> {}

export const InfoPriceListRequestFxVanillaOption = BaseRequest.merge({
  AssetType: literal('FxVanillaOption'),
  PutCall: PutCall,
  ExpiryDate: string({ format: 'date-iso8601' }),
})

export interface InfoPriceListRequestFxVanillaOption extends GuardType<typeof InfoPriceListRequestFxVanillaOption> {}

export const InfoPriceListRequestRights = BaseRequest.merge({
  AssetType: literal('Rights'),
})

export interface InfoPriceListRequestRights extends GuardType<typeof InfoPriceListRequestRights> {}

export const InfoPriceListRequestCfdOnRights = BaseRequest.merge({
  AssetType: literal('CfdOnRights'),
})

export interface InfoPriceListRequestCfdOnRights extends GuardType<typeof InfoPriceListRequestCfdOnRights> {}

export const InfoPriceListRequest = {
  Bond: InfoPriceListRequestBond,
  CfdOnIndex: InfoPriceListRequestCfdOnIndex,
  CompanyWarrant: InfoPriceListRequestCompanyWarrant,
  CfdOnCompanyWarrant: InfoPriceListRequestCfdOnCompanyWarrant,
  Stock: InfoPriceListRequestStock,
  CfdOnStock: InfoPriceListRequestCfdOnStock,
  StockIndexOption: InfoPriceListRequestStockIndexOption,
  StockOption: InfoPriceListRequestStockOption,
  ContractFutures: InfoPriceListRequestContractFutures,
  CfdOnFutures: InfoPriceListRequestCfdOnFutures,
  Etc: InfoPriceListRequestEtc,
  CfdOnEtc: InfoPriceListRequestCfdOnEtc,
  Etf: InfoPriceListRequestEtf,
  CfdOnEtf: InfoPriceListRequestCfdOnEtf,
  Etn: InfoPriceListRequestEtn,
  CfdOnEtn: InfoPriceListRequestCfdOnEtn,
  Fund: InfoPriceListRequestFund,
  CfdOnFund: InfoPriceListRequestCfdOnFund,
  FuturesOption: InfoPriceListRequestFuturesOption,
  FxForwards: InfoPriceListRequestFxForwards,
  FxNoTouchOption: InfoPriceListRequestFxNoTouchOption,
  FxOneTouchOption: InfoPriceListRequestFxOneTouchOption,
  FxSpot: InfoPriceListRequestFxSpot,
  FxSwap: InfoPriceListRequestFxSwap,
  FxVanillaOption: InfoPriceListRequestFxVanillaOption,
  Rights: InfoPriceListRequestRights,
  CfdOnRights: InfoPriceListRequestCfdOnRights,
}

export type InfoPriceListRequest = {
  Bond: InfoPriceListRequestBond
  CfdOnIndex: InfoPriceListRequestCfdOnIndex
  CompanyWarrant: InfoPriceListRequestCompanyWarrant
  CfdOnCompanyWarrant: InfoPriceListRequestCfdOnCompanyWarrant
  Stock: InfoPriceListRequestStock
  CfdOnStock: InfoPriceListRequestCfdOnStock
  StockIndexOption: InfoPriceListRequestStockIndexOption
  StockOption: InfoPriceListRequestStockOption
  ContractFutures: InfoPriceListRequestContractFutures
  CfdOnFutures: InfoPriceListRequestCfdOnFutures
  Etc: InfoPriceListRequestEtc
  CfdOnEtc: InfoPriceListRequestCfdOnEtc
  Etf: InfoPriceListRequestEtf
  CfdOnEtf: InfoPriceListRequestCfdOnEtf
  Etn: InfoPriceListRequestEtn
  CfdOnEtn: InfoPriceListRequestCfdOnEtn
  Fund: InfoPriceListRequestFund
  CfdOnFund: InfoPriceListRequestCfdOnFund
  FuturesOption: InfoPriceListRequestFuturesOption
  FxForwards: InfoPriceListRequestFxForwards
  FxNoTouchOption: InfoPriceListRequestFxNoTouchOption
  FxOneTouchOption: InfoPriceListRequestFxOneTouchOption
  FxSpot: InfoPriceListRequestFxSpot
  FxSwap: InfoPriceListRequestFxSwap
  FxVanillaOption: InfoPriceListRequestFxVanillaOption
  Rights: InfoPriceListRequestRights
  CfdOnRights: InfoPriceListRequestCfdOnRights
}
