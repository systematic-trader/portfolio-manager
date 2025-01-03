import {
  array,
  type GuardType,
  integer,
  literal,
  optional,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType } from '../derives/asset-type.ts'
import { Commissions } from './commissions.ts'
import { HistoricalChanges } from './historical-changes.ts'
import { InstrumentDisplayAndFormat } from './instrument-display-and-format.ts'
import { InstrumentPriceDetails } from './instrument-price-details.ts'
import { MarginImpactBuySell } from './margin-impact-buy-sell.ts'
import { MarketDepth } from './market-depth.ts'
import { PriceInfoDetails } from './price-info-details.ts'
import { PriceInfo } from './price-info.ts'
import { PriceTimestamps } from './price-timestamps.ts'
import { Quote } from './quote.ts'

const DisplayAndFormat = InstrumentDisplayAndFormat.merge({
  /** Not documented */
  LotSizeText: optional(string()),
})

export const PriceResponseBond = props({
  AssetType: literal('Bond'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: props({
    AccruedInterest: InstrumentPriceDetails.pluck('AccruedInterest'),
    AskYield: InstrumentPriceDetails.pluck('AskYield'),
    AverageVolume30Days: InstrumentPriceDetails.pluck('AverageVolume30Days'),
    BidYield: InstrumentPriceDetails.pluck('BidYield'),
    ExpiryDate: InstrumentPriceDetails.pluck('ExpiryDate'),
    IsMarketOpen: InstrumentPriceDetails.pluck('IsMarketOpen'),
    MidYield: InstrumentPriceDetails.pluck('MidYield'),
    ShortTradeDisabled: InstrumentPriceDetails.pluck('ShortTradeDisabled'),
    ValueDate: InstrumentPriceDetails.pluck('ValueDate'),
    PriceFeedType: InstrumentPriceDetails.pluck('PriceFeedType'),
    IndexRatio: optional(InstrumentPriceDetails.pluck('IndexRatio')),
  }),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
  Timestamps: props({
    AskTime: PriceTimestamps.pluck('AskTime'),
    BidTime: PriceTimestamps.pluck('BidTime'),
    CloseTime: PriceTimestamps.pluck('CloseTime'),
    HighTime: PriceTimestamps.pluck('HighTime'),
    LowTime: PriceTimestamps.pluck('LowTime'),
    OpenPriceTime: PriceTimestamps.pluck('OpenPriceTime'),
    LastTradedVolumeTime: optional(PriceTimestamps.pluck('LastTradedVolumeTime')),
  }),
  MarketDepth: optional(MarketDepth),
})

export interface PriceResponseBond extends GuardType<typeof PriceResponseBond> {}

export const PriceResponseCfdOnEtc = props({
  AssetType: literal('CfdOnEtc'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: props({
    AverageVolume: InstrumentPriceDetails.pluck('AverageVolume'),
    AverageVolume30Days: InstrumentPriceDetails.pluck('AverageVolume30Days'),
    CfdBorrowingCost: InstrumentPriceDetails.pluck('CfdBorrowingCost'),
    CfdPriceAdjustment: optional(InstrumentPriceDetails.pluck('CfdPriceAdjustment')),
    IsMarketOpen: InstrumentPriceDetails.pluck('IsMarketOpen'),
    PaidCfdInterest: InstrumentPriceDetails.pluck('PaidCfdInterest'),
    ReceivedCfdInterest: InstrumentPriceDetails.pluck('ReceivedCfdInterest'),
    RelativeVolume: InstrumentPriceDetails.pluck('RelativeVolume'),
    ShortTradeDisabled: InstrumentPriceDetails.pluck('ShortTradeDisabled'),
    ValueDate: InstrumentPriceDetails.pluck('ValueDate'),
  }),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'InitialSpendingPower',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
  MarketDepth: MarketDepth,
})

export interface PriceResponseCfdOnEtc extends GuardType<typeof PriceResponseCfdOnEtc> {}

export const PriceResponseCfdOnEtf = props({
  AssetType: literal('CfdOnEtf'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'CfdBorrowingCost',
    'IsMarketOpen',
    'PaidCfdInterest',
    'ReceivedCfdInterest',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'InitialSpendingPower',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
  MarketDepth: MarketDepth,
  Timestamps: PriceTimestamps.pick([
    'AskTime',
    'BidTime',
    'HighTime',
    'LastTradedVolumeTime',
    'LowTime',
    'OpenPriceTime',
  ]),
})

export interface PriceResponseCfdOnEtf extends GuardType<typeof PriceResponseCfdOnEtf> {}

export const PriceResponseCfdOnEtn = props({
  AssetType: literal('CfdOnEtn'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'CfdBorrowingCost',
    'IsMarketOpen',
    'PaidCfdInterest',
    'ReceivedCfdInterest',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'InitialSpendingPower',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
  MarketDepth: MarketDepth,
})

export interface PriceResponseCfdOnEtn extends GuardType<typeof PriceResponseCfdOnEtn> {}

export const PriceResponseCfdOnFund = props({
  AssetType: literal('CfdOnFund'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'CfdBorrowingCost',
    'IsMarketOpen',
    'PaidCfdInterest',
    'ReceivedCfdInterest',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'InitialSpendingPower',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
  MarketDepth: MarketDepth,
})

export interface PriceResponseCfdOnFund extends GuardType<typeof PriceResponseCfdOnFund> {}

export const PriceResponseCfdOnFutures = props({
  AssetType: literal('CfdOnFutures'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: optional(HistoricalChanges),
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'ExpiryDate',
    'IsMarketOpen',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
  Timestamps: optional(PriceTimestamps.pick([
    'AskTime',
    'BidTime',
    'LastTradedVolumeTime',
  ])),
})

export interface PriceResponseCfdOnFutures extends GuardType<typeof PriceResponseCfdOnFutures> {}

export const PriceResponseCfdOnIndex = props({
  AssetType: literal('CfdOnIndex'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'IsMarketOpen',
    'PaidCfdInterest',
    'ReceivedCfdInterest',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
  Timestamps: PriceTimestamps.pick([
    'AskTime',
    'BidTime',
    'LastTradedVolumeTime',
  ]),
})

export interface PriceResponseCfdOnIndex extends GuardType<typeof PriceResponseCfdOnIndex> {}

export const PriceResponseCfdOnStock = props({
  AssetType: literal('CfdOnStock'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: props({
    AverageVolume: InstrumentPriceDetails.pluck('AverageVolume'),
    AverageVolume30Days: InstrumentPriceDetails.pluck('AverageVolume30Days'),
    CfdBorrowingCost: InstrumentPriceDetails.pluck('CfdBorrowingCost'),
    CfdPriceAdjustment: optional(InstrumentPriceDetails.pluck('CfdPriceAdjustment')),
    IsMarketOpen: InstrumentPriceDetails.pluck('IsMarketOpen'),
    PaidCfdInterest: InstrumentPriceDetails.pluck('PaidCfdInterest'),
    ReceivedCfdInterest: InstrumentPriceDetails.pluck('ReceivedCfdInterest'),
    RelativeVolume: InstrumentPriceDetails.pluck('RelativeVolume'),
    ShortTradeDisabled: InstrumentPriceDetails.pluck('ShortTradeDisabled'),
    ValueDate: InstrumentPriceDetails.pluck('ValueDate'),
  }),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'InitialSpendingPower',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]).merge({
    RiskConcentrationContributingAssetTypes: optional(array(AssetType)),
  }),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
  Timestamps: PriceTimestamps.pick([
    'AskTime',
    'BidTime',
    'HighTime',
    'LastTradedVolumeTime',
    'LowTime',
    'OpenPriceTime',
  ]),
  MarketDepth: MarketDepth,
})

export interface PriceResponseCfdOnStock extends GuardType<typeof PriceResponseCfdOnStock> {}

export const PriceResponseContractFutures = props({
  AssetType: literal('ContractFutures'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AskPricePerContract',
    'AverageVolume',
    'BidPricePerContract',
    'ExpiryDate',
    'IsMarketOpen',
    'NoticeDate',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
})

export interface PriceResponseContractFutures extends GuardType<typeof PriceResponseContractFutures> {}

export const PriceResponseEtc = props({
  AssetType: literal('Etc'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'IsMarketOpen',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
  Timestamps: PriceTimestamps.pick([
    'AskTime',
    'BidTime',
    'HighTime',
    'LastTradedVolumeTime',
    'LowTime',
    'OpenPriceTime',
  ]),
})

export interface PriceResponseEtc extends GuardType<typeof PriceResponseEtc> {}

export const PriceResponseEtf = props({
  AssetType: literal('Etf'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'IsMarketOpen',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
  Timestamps: PriceTimestamps.pick([
    'AskTime',
    'BidTime',
    'HighTime',
    'LastTradedVolumeTime',
    'LowTime',
    'OpenPriceTime',
  ]),
})

export interface PriceResponseEtf extends GuardType<typeof PriceResponseEtf> {}

export const PriceResponseEtn = props({
  AssetType: literal('Etn'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'IsMarketOpen',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
  Timestamps: PriceTimestamps.pick([
    'AskTime',
    'BidTime',
    'HighTime',
    'LastTradedVolumeTime',
    'LowTime',
    'OpenPriceTime',
  ]),
})

export interface PriceResponseEtn extends GuardType<typeof PriceResponseEtn> {}

export const PriceResponseFund = props({
  AssetType: literal('Fund'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'IsMarketOpen',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
})

export interface PriceResponseFund extends GuardType<typeof PriceResponseFund> {}

export const PriceResponseFxForwards = props({
  AssetType: literal('FxForwards'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'ExpiryDate',
    'IsMarketOpen',
    'ShortTradeDisabled',
    'SpotAsk',
    'SpotBid',
    'SpotDate',
    'SwapAsk',
    'SwapBid',
    'ValueDate',
  ]),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  // PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
})

export interface PriceResponseFxForwards extends GuardType<typeof PriceResponseFxForwards> {}

export const PriceResponseFxSpot = props({
  AssetType: literal('FxSpot'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'IsMarketOpen',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
})

export interface PriceResponseFxSpot extends GuardType<typeof PriceResponseFxSpot> {}

export const PriceResponseStock = props({
  AssetType: literal('Stock'),
  Uic: integer(),
  Commissions: Commissions,
  DisplayAndFormat: DisplayAndFormat,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'IsMarketOpen',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarginImpactBuySell: MarginImpactBuySell.pick([
    'CollateralUtilizationAfterTradeBuy',
    'CollateralUtilizationAfterTradeSell',
    'Currency',
    'CurrentCollateralDeductionFromRiskConcentration',
    'EstimatedCollateralDeductionFromRiskConcentration',
    'InitialCollateralAvailableBuy',
    'InitialCollateralAvailableCurrent',
    'InitialCollateralAvailableSell',
    'InitialCollateralBuy',
    'InitialCollateralSell',
    'InitialMarginAndLoanUtilizationBuy',
    'InitialMarginAndLoanUtilizationSell',
    'InitialMarginAvailableBuy',
    'InitialMarginAvailableCurrent',
    'InitialMarginAvailableSell',
    'InitialMarginBuy',
    'InitialMarginSell',
    'InitialMarginUtilizationPercentBuy',
    'InitialMarginUtilizationPercentSell',
    'MaintenanceMarginAndLoanUtilizationBuy',
    'MaintenanceMarginAndLoanUtilizationSell',
    'MaintenanceMarginBuy',
    'MaintenanceMarginSell',
    'MaintenanceMarginUtilizationPercentBuy',
    'MaintenanceMarginUtilizationPercentSell',
    'MarginAndCollateralUtilizationAfterTradeBuy',
    'MarginAndCollateralUtilizationAfterTradeSell',
    'MarginAndLoanUtilizationAfterTradeBuy',
    'MarginAndLoanUtilizationAfterTradeSell',
    'MarginUtilizationPercentBuy',
    'MarginUtilizationPercentSell',
  ]),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  PriceSource: string(),
  Quote: Quote,
  Timestamps: PriceTimestamps.pick([
    'AskTime',
    'BidTime',
    'HighTime',
    'LastTradedVolumeTime',
    'LowTime',
    'OpenPriceTime',
  ]),
})

export interface PriceResponseStock extends GuardType<typeof PriceResponseStock> {}

export const PriceResponse = {
  Bond: PriceResponseBond,
  CfdOnEtc: PriceResponseCfdOnEtc,
  CfdOnEtf: PriceResponseCfdOnEtf,
  CfdOnEtn: PriceResponseCfdOnEtn,
  CfdOnFund: PriceResponseCfdOnFund,
  CfdOnFutures: PriceResponseCfdOnFutures,
  CfdOnIndex: PriceResponseCfdOnIndex,
  CfdOnStock: PriceResponseCfdOnStock,
  ContractFutures: PriceResponseContractFutures,
  Etc: PriceResponseEtc,
  Etf: PriceResponseEtf,
  Etn: PriceResponseEtn,
  Fund: PriceResponseFund,
  FxForwards: PriceResponseFxForwards,
  FxSpot: PriceResponseFxSpot,
  Stock: PriceResponseStock,
} as const

export const PriceResponseUnion = union([
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
])

export type PriceResponseUnion = GuardType<typeof PriceResponseUnion>
