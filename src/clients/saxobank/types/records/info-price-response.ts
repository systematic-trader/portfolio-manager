import {
  type GuardType,
  integer,
  literal,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { TradingErrorCode } from '../derives/trading-error-code.ts'
import { Commissions } from './commissions.ts'
import { Greeks } from './greeks.ts'
import { HistoricalChanges } from './historical-changes.ts'
import { InstrumentDisplayAndFormat } from './instrument-display-and-format.ts'
import { InstrumentPriceDetails } from './instrument-price-details.ts'
import { MarketDepth } from './market-depth.ts'
import { PriceInfoDetails } from './price-info-details.ts'
import { PriceInfo } from './price-info.ts'
import { Quote } from './quote.ts'

const DisplayAndFormat = InstrumentDisplayAndFormat.merge({
  /** Not documented */
  LotSizeText: optional(string()),
})

export const InfoPriceResponseBond = props({
  AssetType: literal('Bond'),
  Uic: integer(),
  PriceInfo: optional(PriceInfo),
  PriceInfoDetails: optional(PriceInfoDetails),
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: optional(HistoricalChanges),
  InstrumentPriceDetails: optional(InstrumentPriceDetails.pick([
    'AccruedInterest',
    'AskYield',
    'AverageVolume30Days',
    'BidYield',
    'IsMarketOpen',
    'MidYield',
    'PriceFeedType',
    'ShortTradeDisabled',
    'ValueDate',
    'IndexRatio',
  ])),
})

export interface InfoPriceResponseBond extends GuardType<typeof InfoPriceResponseBond> {}

export const InfoPriceResponseCfdOnIndex = props({
  AssetType: literal('CfdOnIndex'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'IsMarketOpen',
    'PaidCfdInterest',
    'ReceivedCfdInterest',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
})

export interface InfoPriceResponseCfdOnIndex extends GuardType<typeof InfoPriceResponseCfdOnIndex> {}

export const InfoPriceResponseCompanyWarrant = props({
  AssetType: literal('CompanyWarrant'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: optional(Commissions),
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'IsMarketOpen',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
})

export interface InfoPriceResponseCompanyWarrant extends GuardType<typeof InfoPriceResponseCompanyWarrant> {}

export const InfoPriceResponseCfdOnCompanyWarrant = props({
  AssetType: literal('CfdOnCompanyWarrant'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: MarketDepth,
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
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
})

export interface InfoPriceResponseCfdOnCompanyWarrant extends GuardType<typeof InfoPriceResponseCfdOnCompanyWarrant> {}

export const InfoPriceResponseStock = props({
  AssetType: literal('Stock'),
  Uic: integer(),
  PriceInfo: optional(PriceInfo),
  PriceInfoDetails: optional(PriceInfoDetails),
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: optional(Commissions),
  HistoricalChanges: optional(HistoricalChanges),
  InstrumentPriceDetails: optional(InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'IsMarketOpen',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ])),
})

export interface InfoPriceResponseStock extends GuardType<typeof InfoPriceResponseStock> {}

export const InfoPriceResponseCfdOnStock = props({
  AssetType: literal('CfdOnStock'),
  Uic: integer(),
  PriceInfo: optional(PriceInfo),
  PriceInfoDetails: optional(PriceInfoDetails),
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: optional(Commissions),
  HistoricalChanges: optional(HistoricalChanges),
  InstrumentPriceDetails: optional(InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'CfdBorrowingCost',
    'IsMarketOpen',
    'PaidCfdInterest',
    'ReceivedCfdInterest',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
    'CfdPriceAdjustment',
  ])),
})

export interface InfoPriceResponseCfdOnStock extends GuardType<typeof InfoPriceResponseCfdOnStock> {}

export const InfoPriceResponseStockIndexOption = props({
  AssetType: literal('StockIndexOption'),
  Uic: integer(),
  PriceInfo: optional(PriceInfo),
  PriceInfoDetails: optional(PriceInfoDetails),
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: optional(HistoricalChanges),
  InstrumentPriceDetails: optional(InstrumentPriceDetails.pick([
    'IsMarketOpen',
    'OpenInterest',
    'ShortTradeDisabled',
    'ValueDate',
  ])),
  Greeks: optional(Greeks),
})

export interface InfoPriceResponseStockIndexOption extends GuardType<typeof InfoPriceResponseStockIndexOption> {}

export const InfoPriceResponseStockOption = props({
  AssetType: literal('StockOption'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: optional(HistoricalChanges),
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'IsMarketOpen',
    'OpenInterest',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  Greeks: optional(Greeks),
})

export interface InfoPriceResponseStockOption extends GuardType<typeof InfoPriceResponseStockOption> {}

export const InfoPriceResponseContractFutures = props({
  AssetType: literal('ContractFutures'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: optional(HistoricalChanges),
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'IsMarketOpen',
    'NoticeDate',
    'OpenInterest',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
})

export interface InfoPriceResponseContractFutures extends GuardType<typeof InfoPriceResponseContractFutures> {}

export const InfoPriceResponseCfdOnFutures = props({
  AssetType: literal('CfdOnFutures'),
  Uic: integer(),
  PriceInfo: optional(PriceInfo),
  PriceInfoDetails: optional(PriceInfoDetails),
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: optional(Commissions),
  HistoricalChanges: optional(HistoricalChanges),
  InstrumentPriceDetails: optional(InstrumentPriceDetails.pick([
    'IsMarketOpen',
    'ShortTradeDisabled',
    'ValueDate',
  ])),
})

export interface InfoPriceResponseCfdOnFutures extends GuardType<typeof InfoPriceResponseCfdOnFutures> {}

export const InfoPriceResponseEtc = props({
  AssetType: literal('Etc'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'IsMarketOpen',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
})

export interface InfoPriceResponseEtc extends GuardType<typeof InfoPriceResponseEtc> {}

export const InfoPriceResponseCfdOnEtc = props({
  AssetType: literal('CfdOnEtc'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: MarketDepth,
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
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
    'CfdPriceAdjustment',
  ]),
})

export interface InfoPriceResponseCfdOnEtc extends GuardType<typeof InfoPriceResponseCfdOnEtc> {}

export const InfoPriceResponseEtf = props({
  AssetType: literal('Etf'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: optional(HistoricalChanges),
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'IsMarketOpen',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
})

export interface InfoPriceResponseEtf extends GuardType<typeof InfoPriceResponseEtf> {}

export const InfoPriceResponseCfdOnEtf = props({
  AssetType: literal('CfdOnEtf'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: MarketDepth,
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
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
    'CfdPriceAdjustment',
  ]),
})

export interface InfoPriceResponseCfdOnEtf extends GuardType<typeof InfoPriceResponseCfdOnEtf> {}

export const InfoPriceResponseEtn = props({
  AssetType: literal('Etn'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: optional(Commissions),
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'IsMarketOpen',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
})

export interface InfoPriceResponseEtn extends GuardType<typeof InfoPriceResponseEtn> {}

export const InfoPriceResponseCfdOnEtn = props({
  AssetType: literal('CfdOnEtn'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: MarketDepth,
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: optional(Commissions),
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
})

export interface InfoPriceResponseCfdOnEtn extends GuardType<typeof InfoPriceResponseCfdOnEtn> {}

export const InfoPriceResponseFund = props({
  AssetType: literal('Fund'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: optional(Commissions),
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'IsMarketOpen',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
})

export interface InfoPriceResponseFund extends GuardType<typeof InfoPriceResponseFund> {}

export const InfoPriceResponseCfdOnFund = props({
  AssetType: literal('CfdOnFund'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: MarketDepth,
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
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
    'CfdPriceAdjustment',
  ]),
})

export interface InfoPriceResponseCfdOnFund extends GuardType<typeof InfoPriceResponseCfdOnFund> {}

export const InfoPriceResponseFuturesOption = props({
  AssetType: literal('FuturesOption'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: optional(HistoricalChanges),
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'IsMarketOpen',
    'OpenInterest',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  Greeks: optional(Greeks),
})

export interface InfoPriceResponseFuturesOption extends GuardType<typeof InfoPriceResponseFuturesOption> {}

export const InfoPriceResponseFxForwards = props({
  AssetType: literal('FxForwards'),
  Uic: integer(),
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'IsMarketOpen',
    'ShortTradeDisabled',
    'SpotAsk',
    'SpotBid',
    'SpotDate',
    'SwapAsk',
    'SwapBid',
    'ValueDate',
  ]),
  Greeks: optional(Greeks),
})

export interface InfoPriceResponseFxForwards extends GuardType<typeof InfoPriceResponseFxForwards> {}

export const InfoPriceResponseFxNoTouchOption = props({
  AssetType: literal('FxNoTouchOption'),
  Uic: integer(),
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: optional(HistoricalChanges),
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'ExpiryDate',
    'IsMarketOpen',
    'MidForwardPrice',
    'MidSpotPrice',
    'ShortTradeDisabled',
    'SpotAsk',
    'SpotBid',
    'SpotDate',
    'ValueDate',
  ]),
  Greeks: optional(Greeks),
})

export interface InfoPriceResponseFxNoTouchOption extends GuardType<typeof InfoPriceResponseFxNoTouchOption> {}

export const InfoPriceResponseFxOneTouchOption = props({
  AssetType: literal('FxOneTouchOption'),
  Uic: integer(),
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: optional(HistoricalChanges),
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'ExpiryDate',
    'IsMarketOpen',
    'MidForwardPrice',
    'MidSpotPrice',
    'ShortTradeDisabled',
    'SpotAsk',
    'SpotBid',
    'SpotDate',
    'ValueDate',
  ]),
  Greeks: optional(Greeks),
})

export interface InfoPriceResponseFxOneTouchOption extends GuardType<typeof InfoPriceResponseFxOneTouchOption> {}

export const InfoPriceResponseFxSpot = props({
  AssetType: literal('FxSpot'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: MarketDepth,
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'IsMarketOpen',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
  Greeks: optional(Greeks),
})

export interface InfoPriceResponseFxSpot extends GuardType<typeof InfoPriceResponseFxSpot> {}

export const InfoPriceResponseFxSwap = props({
  AssetType: literal('FxSwap'),
  Uic: integer(),
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: optional(HistoricalChanges),
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'FarLegAsk',
    'FarLegBid',
    'FarLegMidPrice',
    'ForwardDateFarLeg',
    'ForwardDateNearLeg',
    'IsMarketOpen',
    'NearLegMidPrice',
    'ShortTradeDisabled',
    'SpotAsk',
    'SpotBid',
    'SwapAsk',
    'SwapBid',
    'ValueDate',
  ]),
  Greeks: optional(Greeks),
})

export interface InfoPriceResponseFxSwap extends GuardType<typeof InfoPriceResponseFxSwap> {}

export const InfoPriceResponseFxVanillaOption = props({
  AssetType: literal('FxVanillaOption'),
  Uic: integer(),
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'ExpiryDate',
    'IsMarketOpen',
    'MidForwardPrice',
    'MidSpotPrice',
    'ShortTradeDisabled',
    'SpotAsk',
    'SpotBid',
    'SpotDate',
    'ValueDate',
  ]),
  Greeks: optional(Greeks),
})

export interface InfoPriceResponseFxVanillaOption extends GuardType<typeof InfoPriceResponseFxVanillaOption> {}

export const InfoPriceResponseRights = props({
  AssetType: literal('Rights'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: optional(MarketDepth),
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: optional(HistoricalChanges),
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'IsMarketOpen',
    'RelativeVolume',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
})

export interface InfoPriceResponseRights extends GuardType<typeof InfoPriceResponseRights> {}

export const InfoPriceResponseCfdOnRights = props({
  AssetType: literal('CfdOnRights'),
  Uic: integer(),
  PriceInfo: PriceInfo,
  PriceInfoDetails: PriceInfoDetails,
  DisplayAndFormat: optional(DisplayAndFormat),
  LastUpdated: string({ format: 'date-iso8601' }),
  MarketDepth: MarketDepth,
  PriceSource: optional(string()),
  Quote: Quote,
  ErrorCode: optional(TradingErrorCode),
  Commissions: Commissions,
  HistoricalChanges: HistoricalChanges,
  InstrumentPriceDetails: InstrumentPriceDetails.pick([
    'AverageVolume',
    'AverageVolume30Days',
    'CfdBorrowingCost',
    'CfdPriceAdjustment',
    'IsMarketOpen',
    'PaidCfdInterest',
    'ReceivedCfdInterest',
    'ShortTradeDisabled',
    'ValueDate',
  ]),
})

export interface InfoPriceResponseCfdOnRights extends GuardType<typeof InfoPriceResponseCfdOnRights> {}

export const InfoPriceResponse = {
  Bond: InfoPriceResponseBond,
  CfdOnIndex: InfoPriceResponseCfdOnIndex,
  CompanyWarrant: InfoPriceResponseCompanyWarrant,
  CfdOnCompanyWarrant: InfoPriceResponseCfdOnCompanyWarrant,
  Stock: InfoPriceResponseStock,
  CfdOnStock: InfoPriceResponseCfdOnStock,
  StockIndexOption: InfoPriceResponseStockIndexOption,
  StockOption: InfoPriceResponseStockOption,
  ContractFutures: InfoPriceResponseContractFutures,
  CfdOnFutures: InfoPriceResponseCfdOnFutures,
  Etc: InfoPriceResponseEtc,
  CfdOnEtc: InfoPriceResponseCfdOnEtc,
  Etf: InfoPriceResponseEtf,
  CfdOnEtf: InfoPriceResponseCfdOnEtf,
  Etn: InfoPriceResponseEtn,
  CfdOnEtn: InfoPriceResponseCfdOnEtn,
  Fund: InfoPriceResponseFund,
  CfdOnFund: InfoPriceResponseCfdOnFund,
  FuturesOption: InfoPriceResponseFuturesOption,
  FxForwards: InfoPriceResponseFxForwards,
  FxNoTouchOption: InfoPriceResponseFxNoTouchOption,
  FxOneTouchOption: InfoPriceResponseFxOneTouchOption,
  FxSpot: InfoPriceResponseFxSpot,
  FxSwap: InfoPriceResponseFxSwap,
  FxVanillaOption: InfoPriceResponseFxVanillaOption,
  Rights: InfoPriceResponseRights,
  CfdOnRights: InfoPriceResponseCfdOnRights,
} as const

export type InfoPriceResponse = {
  Bond: InfoPriceResponseBond
  CfdOnIndex: InfoPriceResponseCfdOnIndex
  CompanyWarrant: InfoPriceResponseCompanyWarrant
  CfdOnCompanyWarrant: InfoPriceResponseCfdOnCompanyWarrant
  Stock: InfoPriceResponseStock
  CfdOnStock: InfoPriceResponseCfdOnStock
  StockIndexOption: InfoPriceResponseStockIndexOption
  StockOption: InfoPriceResponseStockOption
  ContractFutures: InfoPriceResponseContractFutures
  CfdOnFutures: InfoPriceResponseCfdOnFutures
  Etc: InfoPriceResponseEtc
  CfdOnEtc: InfoPriceResponseCfdOnEtc
  Etf: InfoPriceResponseEtf
  CfdOnEtf: InfoPriceResponseCfdOnEtf
  Etn: InfoPriceResponseEtn
  CfdOnEtn: InfoPriceResponseCfdOnEtn
  Fund: InfoPriceResponseFund
  CfdOnFund: InfoPriceResponseCfdOnFund
  FuturesOption: InfoPriceResponseFuturesOption
  FxForwards: InfoPriceResponseFxForwards
  FxNoTouchOption: InfoPriceResponseFxNoTouchOption
  FxOneTouchOption: InfoPriceResponseFxOneTouchOption
  FxSpot: InfoPriceResponseFxSpot
  FxSwap: InfoPriceResponseFxSwap
  FxVanillaOption: InfoPriceResponseFxVanillaOption
  Rights: InfoPriceResponseRights
  CfdOnRights: InfoPriceResponseCfdOnRights
}
