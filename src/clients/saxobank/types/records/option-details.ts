import {
  array,
  boolean,
  enums,
  type GuardType,
  integer,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType, AssetTypeValues } from '../derives/asset-type.ts'
import { ContractOption } from '../derives/contract-option.ts'
import { Currency3 } from '../derives/currency.ts'
import { ExerciseStyle } from '../derives/exercise-style.ts'
import { LotSizeType } from '../derives/lot-size-type.ts'
import { OptionsStrategyType } from '../derives/options-strategy-type.ts'
import { PlaceableOrderType } from '../derives/placeable-order-type.ts'
import { SettlementStyle } from '../derives/settlement-style.ts'
import { ContractOptionEntry } from './contract-option-entry.ts'
import { ExchangeSummary } from './exchange-summary.ts'
import { InstrumentKey } from './instrument-key.ts'
import { OrderDistances } from './order-distances.ts'
import { PriceDisplayFormat } from './price-display-format.ts'
import { RelatedOptionRoot } from './related-option-root.ts'

export const OptionAssetTypeValues = AssetTypeValues.filter((assetType) => {
  return assetType === 'FuturesOption' ||
    assetType === 'FxNoTouchOption' ||
    assetType === 'FxOneTouchOption' ||
    assetType === 'FxVanillaOption' ||
    assetType === 'StockOption' ||
    assetType === 'StockIndexOption'
})

export type OptionDetails = GuardType<typeof OptionDetails>

export const OptionDetails = props({
  AmountDecimals: integer(),
  AssetType: enums(OptionAssetTypeValues),
  CanParticipateInMultiLegOrder: boolean(),
  ContractSize: number(),
  CurrencyCode: Currency3,
  DefaultAmount: number(),
  DefaultExpiry: optional(string()),
  DefaultOption: optional(ContractOption),
  Description: string(),
  Exchange: ExchangeSummary,
  ExerciseStyle: ExerciseStyle,
  Format: PriceDisplayFormat,
  GroupId: integer(),
  GroupOptionRootId: integer(),
  IncrementSize: number(),
  IsTradable: boolean(),
  LotSize: number(),
  LotSizeType: LotSizeType,
  MaximumStrikePrice: optional(number()),
  MinimumStrikePrice: optional(number()),
  OptionRootId: integer(),
  OptionSpace: optional(array(ContractOptionEntry)),
  OrderDistances,
  PriceToContractFactor: number(),
  RelatedInstruments: optional(array(InstrumentKey)),
  RelatedOptionRoots: optional(array(integer())),
  RelatedOptionRootsEnhanced: optional(array(RelatedOptionRoot)),
  SettlementStyle,
  StandardAmounts: array(number()),
  SupportedOrderTypes: array(PlaceableOrderType),
  SupportedStrategies: array(OptionsStrategyType),
  Symbol: string(),
  TickSize: number(),
  TradableOn: array(string()),
  UnderlyingAssetType: AssetType,
})
