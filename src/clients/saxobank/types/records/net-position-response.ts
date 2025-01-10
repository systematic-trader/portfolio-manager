import {
  boolean,
  type GuardType,
  integer,
  literal,
  number,
  optional,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType } from '../derives/asset-type.ts'
import { BuySell } from '../derives/buy-sell.ts'
import { CalculationReliability } from '../derives/calculation-reliability.ts'
import { Currency3 } from '../derives/currency.ts'
import { MarketState } from '../derives/market-state.ts'
import { NonTradableReason } from '../derives/non-tradable-reason.ts'
import { PositionStatus } from '../derives/position-status.ts'
import { PriceType } from '../derives/price-type.ts'
import { TradingStatus } from '../derives/trading-status.ts'
import { FixedIncomeData } from './fixed-income-data.ts'
import { InstrumentDisplayAndFormat } from './instrument-display-and-format.ts'

const Exchange = props({
  Description: optional(string()),
  ExchangeId: optional(string()),
  IsOpen: boolean(),
  TimeZoneId: string(),
})

// #region Bond
export const NetPositionResponseBond = props({
  NetPositionBase: props({
    AssetType: literal('Bond'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    ExpiryDate: string({ format: 'date-iso8601' }),
    FixedIncomeData,
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    Ask: optional(number()),
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    Bid: optional(number()),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: optional(number()),
    CurrentPriceDelayMinutes: optional(number()),
    CurrentPriceLastTraded: optional(string({ format: 'date-iso8601' })),
    CurrentPriceType: optional(PriceType),
    Exposure: optional(number()),
    ExposureCurrency: optional(Currency3),
    ExposureInBaseCurrency: optional(number()),
    InstrumentPriceDayPercentChange: optional(number()),
    MarketValue: optional(number()),
    MarketValueInBaseCurrency: optional(number()),
    MarketValueOpen: number(),
    MarketValueOpenInBaseCurrency: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossCurrencyConversion: optional(number()),
    ProfitLossOnTrade: optional(number()),
    ProfitLossOnTradeInBaseCurrency: optional(number()),
    Status: PositionStatus,
    TradeCostsTotal: optional(number()),
    TradeCostsTotalInBaseCurrency: optional(number()),
  }),
})

export interface NetPositionResponseBond extends GuardType<typeof NetPositionResponseBond> {}
// #endregion

// #region CfdOnEtc
export const NetPositionResponseCfdOnEtc = props({
  NetPositionBase: props({
    AssetType: literal('CfdOnEtc'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: optional(number()),
  }),
})

export interface NetPositionResponseCfdOnEtc extends GuardType<typeof NetPositionResponseCfdOnEtc> {}
// #endregion

// #region CfdOnEtf
export const NetPositionResponseCfdOnEtf = props({
  NetPositionBase: props({
    AssetType: literal('CfdOnEtf'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: optional(number()),
  }),
})

export interface NetPositionResponseCfdOnEtf extends GuardType<typeof NetPositionResponseCfdOnEtf> {}
// #endregion

// todo no instruments to base the test on
// #region CfdOnEtn
export const NetPositionResponseCfdOnEtn = props({
  NetPositionBase: props({
    AssetType: literal('CfdOnEtn'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: optional(number()),
  }),
})

export interface NetPositionResponseCfdOnEtn extends GuardType<typeof NetPositionResponseCfdOnEtn> {}
// #endregion

// #region CfdOnFund
export const NetPositionResponseCfdOnFund = props({
  NetPositionBase: props({
    AssetType: literal('CfdOnFund'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: optional(number()),
  }),
})

export interface NetPositionResponseCfdOnFund extends GuardType<typeof NetPositionResponseCfdOnFund> {}
// #endregion

// #region CfdOnFutures
export const NetPositionResponseCfdOnFutures = props({
  NetPositionBase: props({
    AssetType: literal('CfdOnFutures'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    ExpiryDate: string({ format: 'date-iso8601' }),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: optional(number()),
  }),
})

export interface NetPositionResponseCfdOnFutures extends GuardType<typeof NetPositionResponseCfdOnFutures> {}
// #endregion

// #region CfdOnIndex
export const NetPositionResponseCfdOnIndex = props({
  NetPositionBase: props({
    AssetType: literal('CfdOnIndex'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: optional(number()),
  }),
})

export interface NetPositionResponseCfdOnIndex extends GuardType<typeof NetPositionResponseCfdOnIndex> {}
// #endregion

// #region CfdOnStock
export const NetPositionResponseCfdOnStock = props({
  NetPositionBase: props({
    AssetType: literal('CfdOnStock'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: optional(number()),
  }),
})

export interface NetPositionResponseCfdOnStock extends GuardType<typeof NetPositionResponseCfdOnStock> {}
// #endregion

// #region ContractFutures
export const NetPositionResponseContractFutures = props({
  NetPositionBase: props({
    AssetType: literal('ContractFutures'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    ExpiryDate: string({ format: 'date-iso8601' }),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NoticeDate: optional(string({ format: 'date-iso8601' })),
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    OpenInterest: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: optional(number()),
  }),
})

export interface NetPositionResponseContractFutures extends GuardType<typeof NetPositionResponseContractFutures> {}
// #endregion

// #region Etc
export const NetPositionResponseEtc = props({
  NetPositionBase: props({
    AssetType: literal('Etc'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketValueOpen: number(),
    MarketValueOpenInBaseCurrency: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossCurrencyConversion: optional(number()),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: optional(number()),
  }),
})

export interface NetPositionResponseEtc extends GuardType<typeof NetPositionResponseEtc> {}
// #endregion

// #region Etf
export const NetPositionResponseEtf = props({
  NetPositionBase: props({
    AssetType: literal('Etf'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    Ask: optional(number()),
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    Bid: optional(number()),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceLastTraded: optional(string({ format: 'date-iso8601' })),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketValue: optional(number()),
    MarketValueInBaseCurrency: optional(number()),
    MarketValueOpen: number(),
    MarketValueOpenInBaseCurrency: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossCurrencyConversion: optional(number()),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: optional(number()),
  }),
})

export interface NetPositionResponseEtf extends GuardType<typeof NetPositionResponseEtf> {}
// #endregion

// #region Etn
export const NetPositionResponseEtn = props({
  NetPositionBase: props({
    AssetType: literal('Etn'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketValueOpen: number(),
    MarketValueOpenInBaseCurrency: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossCurrencyConversion: optional(number()),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: optional(number()),
  }),
})

export interface NetPositionResponseEtn extends GuardType<typeof NetPositionResponseEtn> {}
// #endregion

// #region Fund
export const NetPositionResponseFund = props({
  NetPositionBase: props({
    AssetType: literal('Fund'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketValueOpen: number(),
    MarketValueOpenInBaseCurrency: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossCurrencyConversion: optional(number()),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: optional(number()),
  }),
})

export interface NetPositionResponseFund extends GuardType<typeof NetPositionResponseFund> {}
// #endregion

// #region FxForwards
export const NetPositionResponseFxForwards = props({
  NetPositionBase: props({
    AssetType: literal('FxForwards'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    Ask: number(),
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    Bid: number(),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
  }),
})

export interface NetPositionResponseFxForwards extends GuardType<typeof NetPositionResponseFxForwards> {}
// #endregion

// #region FxSpot
export const NetPositionResponseFxSpot = props({
  NetPositionBase: props({
    AssetType: literal('FxSpot'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    Ask: number(),
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    Bid: number(),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
  }),
})

export interface NetPositionResponseFxSpot extends GuardType<typeof NetPositionResponseFxSpot> {}
// #endregion

// #region Stock
export const NetPositionResponseStock = props({
  NetPositionBase: props({
    AssetType: literal('Stock'),

    Amount: number(),
    AmountLong: number(),
    AmountShort: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    HasForceOpenPositions: boolean(),
    IsMarketOpen: boolean(),
    MarketState,
    NonTradableReason,
    NumberOfRelatedOrders: integer(),
    OpeningDirection: BuySell,
    OpenIpoOrdersCount: integer(),
    OpenOrdersCount: integer(),
    OpenTriggerOrdersCount: integer(),
    PositionsAccount: optional(string()),
    SinglePositionId: optional(string()),
    SinglePositionStatus: optional(PositionStatus),
    TradingStatus,
    Uic: integer(),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
  NetPositionView: props({
    Ask: optional(number()),
    AverageOpenPrice: number(),
    AverageOpenPriceIncludingCosts: number(),
    Bid: optional(number()),
    CalculationReliability,
    ConversionRateCurrent: optional(number()),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceLastTraded: optional(string({ format: 'date-iso8601' })),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketValue: optional(number()),
    MarketValueInBaseCurrency: optional(number()),
    MarketValueOpen: number(),
    MarketValueOpenInBaseCurrency: number(),
    PositionCount: number(),
    PositionsAverageBuyPrice: number(),
    PositionsAverageSellPrice: number(),
    PositionsNotClosedCount: number(),
    ProfitLossCurrencyConversion: optional(number()),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Status: PositionStatus,
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: optional(number()),
  }),
})

export interface NetPositionResponseStock extends GuardType<typeof NetPositionResponseStock> {}
// #endregion

// #region Unknown
export const NetPositionResponseUnknown = props({
  NetPositionBase: props({
    AssetType: AssetType.exclude([
      'Bond',
      'CfdOnEtc',
      'CfdOnEtf',
      'CfdOnEtn',
      'CfdOnFund',
      'CfdOnFutures',
      'CfdOnIndex',
      'CfdOnStock',
      'ContractFutures',
      'Etc',
      'Etf',
      'Etn',
      'Fund',
      'FxForwards',
      'FxSpot',
      'Stock',
    ]),
  }, { extendable: true }),
  NetPositionId: string(),
}, { extendable: true })

export interface NetPositionResponseUnknown extends GuardType<typeof NetPositionResponseUnknown> {}
// #endregion

export const NetPositionResponseUnion = union([
  NetPositionResponseBond,
  NetPositionResponseCfdOnEtc,
  NetPositionResponseCfdOnEtf,
  NetPositionResponseCfdOnEtn,
  NetPositionResponseCfdOnFund,
  NetPositionResponseCfdOnFutures,
  NetPositionResponseCfdOnIndex,
  NetPositionResponseCfdOnStock,
  NetPositionResponseContractFutures,
  NetPositionResponseEtc,
  NetPositionResponseEtf,
  NetPositionResponseEtn,
  NetPositionResponseFund,
  NetPositionResponseFxForwards,
  NetPositionResponseFxSpot,
  NetPositionResponseStock,
  NetPositionResponseUnknown,
])

export type NetPositionResponseUnion =
  | NetPositionResponseBond
  | NetPositionResponseCfdOnEtc
  | NetPositionResponseCfdOnEtf
  | NetPositionResponseCfdOnEtn
  | NetPositionResponseCfdOnFund
  | NetPositionResponseCfdOnFutures
  | NetPositionResponseCfdOnIndex
  | NetPositionResponseCfdOnStock
  | NetPositionResponseContractFutures
  | NetPositionResponseEtc
  | NetPositionResponseEtf
  | NetPositionResponseEtn
  | NetPositionResponseFund
  | NetPositionResponseFxForwards
  | NetPositionResponseFxSpot
  | NetPositionResponseStock
  | NetPositionResponseUnknown
