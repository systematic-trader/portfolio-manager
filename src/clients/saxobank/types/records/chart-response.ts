import {
  array,
  type GuardType,
  integer,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ChartInfo } from './chart-info.ts'
import { ChartSampleBidAskOHLC, ChartSampleOHLC } from './chart-sample.ts'
import { DisplayAndFormat } from './display-and-format.ts'

export const ChartResponseBond = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseBond extends GuardType<typeof ChartResponseBond> {}

export const ChartResponseCfdOnCompanyWarrant = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseCfdOnCompanyWarrant extends GuardType<typeof ChartResponseCfdOnCompanyWarrant> {}

export const ChartResponseCfdOnEtc = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseCfdOnEtc extends GuardType<typeof ChartResponseCfdOnEtc> {}

export const ChartResponseCfdOnEtf = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseCfdOnEtf extends GuardType<typeof ChartResponseCfdOnEtf> {}

export const ChartResponseCfdOnEtn = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseCfdOnEtn extends GuardType<typeof ChartResponseCfdOnEtn> {}

export const ChartResponseCfdOnFund = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseCfdOnFund extends GuardType<typeof ChartResponseCfdOnFund> {}

export const ChartResponseCfdOnFutures = props({
  ChartInfo,
  Data: optional(array(ChartSampleBidAskOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseCfdOnFutures extends GuardType<typeof ChartResponseCfdOnFutures> {}

export const ChartResponseCfdOnIndex = props({
  ChartInfo,
  Data: optional(array(ChartSampleBidAskOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseCfdOnIndex extends GuardType<typeof ChartResponseCfdOnIndex> {}

export const ChartResponseCfdOnRights = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseCfdOnRights extends GuardType<typeof ChartResponseCfdOnRights> {}

export const ChartResponseCfdOnStock = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseCfdOnStock extends GuardType<typeof ChartResponseCfdOnStock> {}

export const ChartResponseCompanyWarrant = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseCompanyWarrant extends GuardType<typeof ChartResponseCompanyWarrant> {}

export const ChartResponseContractFutures = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseContractFutures extends GuardType<typeof ChartResponseContractFutures> {}

export const ChartResponseEtc = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseEtc extends GuardType<typeof ChartResponseEtc> {}

export const ChartResponseEtf = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseEtf extends GuardType<typeof ChartResponseEtf> {}

export const ChartResponseEtn = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseEtn extends GuardType<typeof ChartResponseEtn> {}

export const ChartResponseFund = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseFund extends GuardType<typeof ChartResponseFund> {}

export const ChartResponseFxSpot = props({
  ChartInfo,
  Data: optional(array(ChartSampleBidAskOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseFxSpot extends GuardType<typeof ChartResponseFxSpot> {}

export const ChartResponseRights = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseRights extends GuardType<typeof ChartResponseRights> {}

export const ChartResponseStock = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseStock extends GuardType<typeof ChartResponseStock> {}

export const ChartResponseStockIndex = props({
  ChartInfo,
  Data: optional(array(ChartSampleOHLC)),
  DataVersion: integer(),
  DisplayAndFormat,
})

export interface ChartResponseStockIndex extends GuardType<typeof ChartResponseStockIndex> {}

export const ChartResponse = {
  Bond: ChartResponseBond,
  CfdOnCompanyWarrant: ChartResponseCfdOnCompanyWarrant,
  CfdOnEtc: ChartResponseCfdOnEtc,
  CfdOnEtf: ChartResponseCfdOnEtf,
  CfdOnEtn: ChartResponseCfdOnEtn,
  CfdOnFund: ChartResponseCfdOnFund,
  CfdOnFutures: ChartResponseCfdOnFutures,
  CfdOnIndex: ChartResponseCfdOnIndex,
  CfdOnRights: ChartResponseCfdOnRights,
  CfdOnStock: ChartResponseCfdOnStock,
  CompanyWarrant: ChartResponseCompanyWarrant,
  ContractFutures: ChartResponseContractFutures,
  Etc: ChartResponseEtc,
  Etf: ChartResponseEtf,
  Etn: ChartResponseEtn,
  Fund: ChartResponseFund,
  FxSpot: ChartResponseFxSpot,
  Rights: ChartResponseRights,
  Stock: ChartResponseStock,
  StockIndex: ChartResponseStockIndex,
} as const

export type ChartResponse = {
  Bond: ChartResponseBond
  CfdOnCompanyWarrant: ChartResponseCfdOnCompanyWarrant
  CfdOnEtc: ChartResponseCfdOnEtc
  CfdOnEtf: ChartResponseCfdOnEtf
  CfdOnEtn: ChartResponseCfdOnEtn
  CfdOnFund: ChartResponseCfdOnFund
  CfdOnFutures: ChartResponseCfdOnFutures
  CfdOnIndex: ChartResponseCfdOnIndex
  CfdOnRights: ChartResponseCfdOnRights
  CfdOnStock: ChartResponseCfdOnStock
  CompanyWarrant: ChartResponseCompanyWarrant
  ContractFutures: ChartResponseContractFutures
  Etc: ChartResponseEtc
  Etf: ChartResponseEtf
  Etn: ChartResponseEtn
  Fund: ChartResponseFund
  FxSpot: ChartResponseFxSpot
  Rights: ChartResponseRights
  Stock: ChartResponseStock
  StockIndex: ChartResponseStockIndex
}
