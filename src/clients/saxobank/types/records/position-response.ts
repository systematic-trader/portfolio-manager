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
import { CalculationReliability } from '../derives/calculation-reliability.ts'
import { Currency3 } from '../derives/currency.ts'
import { MarketState } from '../derives/market-state.ts'
import { PositionStatus } from '../derives/position-status.ts'
import { PriceType } from '../derives/price-type.ts'
import { FixedIncomeData } from './fixed-income-data.ts'
import { InstrumentDisplayAndFormat } from './instrument-display-and-format.ts'
import { InstrumentExchangeDetails } from './instrument-exchange-details.ts'
import { PositionCost } from './position-cost.ts'
import { SettlementInstructions } from './settlement-instructions.ts'

export const PositionDynamic = props({
  /** The current market ask price */
  Ask: optional(number()),

  /** The current market bid price */
  Bid: optional(number()),

  /** If an error was encountered this code indicates source of the calculation error */
  CalculationReliability: CalculationReliability,

  /** Conversion rate used for closing trade costs */
  ConversionRateClose: optional(number()),

  /** Current conversion rate used for opening trade costs */
  ConversionRateCurrent: number(),

  /** Conversion rate used for opening trade costs */
  ConversionRateOpen: number(),

  /** The current price for the instrument */
  CurrentPrice: number(),

  /** If set, it defines the number of minutes by which the price is delayed */
  CurrentPriceDelayMinutes: integer(),

  /** Indicates when the user specific current market price of the instrument was last traded */
  CurrentPriceLastTraded: optional(string({ format: 'date-iso8601' })),

  /** The price type (Bid/Ask/LastTraded) of the user specific(delayed/realtime) current market price of the instrument */
  CurrentPriceType: PriceType,

  /** Current nominal value of position, but differs from market value in that it has a value for margin products */
  Exposure: number(),

  /** Currency of exposure */
  ExposureCurrency: string(),

  /**
   * Current nominal value of position, but differs from market value in that it has a value for margin products.
   * Converted to requesting account/client currency.
   */
  ExposureInBaseCurrency: number(),

  /** Current IndexRatio, Applicable for Inflation linked bonds */
  IndexRatio: optional(number()),

  /** Percent change in instrument's price between Previous Close and current Last Traded price. */
  InstrumentPriceDayPercentChange: number(),

  MarketState: MarketState,

  /** Market value of position excl. closing costs */
  MarketValue: number(),

  /** The total nominal value of the of the underlying positions, in requested account/client currency */
  MarketValueInBaseCurrency: number(),

  /** The value of the position at time of opening */
  MarketValueOpen: optional(number()),

  /** The nominal value of the position at the time of open, in requested account/client currency. */
  MarketValueOpenInBaseCurrency: optional(number()),

  /** The total number of contracts that have not been settled and remain open as of the end of a trading day */
  OpenInterest: optional(number()),

  /** The P/L from currency conversion between now and position open */
  ProfitLossCurrencyConversion: optional(number()),

  /** The P/L in the quote currency */
  ProfitLossOnTrade: number(),

  /** The P/L on in the client/account base currency */
  ProfitLossOnTradeInBaseCurrency: number(),

  /** SettlementInstruction */
  SettlementInstruction: optional(SettlementInstructions),

  /** The sum of all open costs and realized/unrealized close costs for the underlying positions, in instrument currency. */
  TradeCostsTotal: number(),

  /** The sum of all open costs and realized/unrealized close costs for the underlying positions. */
  TradeCostsTotalInBaseCurrency: number(),

  /** Underlying current price */
  UnderlyingCurrentPrice: optional(number()),

  /** Not documented */
  ProfitLossOnTradeIntraday: optional(number()),

  /** Not documented */
  ProfitLossOnTradeIntradayInBaseCurrency: optional(number()),
})

// #region Bond
export const PositionResponseBond = props({
  PositionBase: props({
    AssetType: literal('Bond'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    ExpiryDate: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    FixedIncomeData: FixedIncomeData,
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenIndexRatio: optional(number()),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  Costs: PositionCost,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails,
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    Ask: optional(number()),
    Bid: optional(number()),
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: optional(number()),
    ConversionRateOpen: optional(number()),
    CurrentPrice: optional(number()),
    CurrentPriceDelayMinutes: optional(integer()),
    CurrentPriceLastTraded: optional(string({ format: 'date-iso8601' })),
    CurrentPriceType: optional(PriceType),
    Exposure: optional(number()),
    ExposureCurrency: optional(Currency3),
    ExposureInBaseCurrency: optional(number()),
    IndexRatio: optional(number()),
    InstrumentPriceDayPercentChange: optional(number()),
    MarketState: optional(MarketState),
    MarketValue: optional(number()),
    MarketValueInBaseCurrency: optional(number()),
    MarketValueOpen: optional(number()),
    MarketValueOpenInBaseCurrency: optional(number()),
    ProfitLossCurrencyConversion: optional(number()),
    ProfitLossOnTrade: optional(number()),
    ProfitLossOnTradeInBaseCurrency: optional(number()),
    ProfitLossOnTradeIntraday: optional(number()),
    ProfitLossOnTradeIntradayInBaseCurrency: optional(number()),
    TradeCostsTotal: optional(number()),
    TradeCostsTotalInBaseCurrency: optional(number()),
  }),
})

export interface PositionResponseBond extends GuardType<typeof PositionResponseBond> {}
// #endregion

// #region CfdOnEtc
export const PositionResponseCfdOnEtc = props({
  PositionBase: props({
    AssetType: literal('CfdOnEtc'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  Costs: PositionCost,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails,
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    ProfitLossOnTradeIntraday: number(),
    ProfitLossOnTradeIntradayInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: number(),
  }),
})

export interface PositionResponseCfdOnEtc extends GuardType<typeof PositionResponseCfdOnEtc> {}
// #endregion

// #region CfdOnEtf
export const PositionResponseCfdOnEtf = props({
  PositionBase: props({
    AssetType: literal('CfdOnEtf'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    // ExpiryDate: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  Costs: PositionCost,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails,
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    ProfitLossOnTradeIntraday: number(),
    ProfitLossOnTradeIntradayInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: number(),
  }),
})

export interface PositionResponseCfdOnEtf extends GuardType<typeof PositionResponseCfdOnEtf> {}
// #endregion

// #region CfdOnEtn
export const PositionResponseCfdOnEtn = props({
  PositionBase: props({
    AssetType: literal('CfdOnEtn'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    // ExpiryDate: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  Costs: PositionCost,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails,
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    ProfitLossOnTradeIntraday: number(),
    ProfitLossOnTradeIntradayInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: number(),
  }),
})

export interface PositionResponseCfdOnEtn extends GuardType<typeof PositionResponseCfdOnEtn> {}
// #endregion

// #region CfdOnFund
export const PositionResponseCfdOnFund = props({
  PositionBase: props({
    AssetType: literal('CfdOnFund'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  Costs: PositionCost,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails,
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    ProfitLossOnTradeIntraday: number(),
    ProfitLossOnTradeIntradayInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: number(),
  }),
})

export interface PositionResponseCfdOnFund extends GuardType<typeof PositionResponseCfdOnFund> {}
// #endregion

// #region CfdOnFutures
export const PositionResponseCfdOnFutures = props({
  PositionBase: props({
    AssetType: literal('CfdOnFutures'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    ExpiryDate: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails.omit(['Description', 'ExchangeId']),
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    ProfitLossOnTradeIntraday: number(),
    ProfitLossOnTradeIntradayInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: number(),
  }),
})

export interface PositionResponseCfdOnFutures extends GuardType<typeof PositionResponseCfdOnFutures> {}
// #endregion

// #region CfdOnIndex
export const PositionResponseCfdOnIndex = props({
  PositionBase: props({
    AssetType: literal('CfdOnIndex'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails.omit(['Description', 'ExchangeId']),
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    ProfitLossOnTradeIntraday: number(),
    ProfitLossOnTradeIntradayInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: number(),
  }),
})

export interface PositionResponseCfdOnIndex extends GuardType<typeof PositionResponseCfdOnIndex> {}
// #endregion

// #region CfdOnStock
export const PositionResponseCfdOnStock = props({
  PositionBase: props({
    AssetType: literal('CfdOnStock'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  Costs: PositionCost,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails,
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    ProfitLossOnTradeIntraday: number(),
    ProfitLossOnTradeIntradayInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: number(),
  }),
})

export interface PositionResponseCfdOnStock extends GuardType<typeof PositionResponseCfdOnStock> {}
// #endregion

// #region ContractFutures
export const PositionResponseContractFutures = props({
  PositionBase: props({
    AssetType: literal('ContractFutures'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    ExpiryDate: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    NoticeDate: optional(string({ format: 'date-iso8601' })),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  Costs: PositionCost,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails,
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    OpenInterest: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    ProfitLossOnTradeIntraday: number(),
    ProfitLossOnTradeIntradayInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: number(),
  }),
})

export interface PositionResponseContractFutures extends GuardType<typeof PositionResponseContractFutures> {}
// #endregion

// #region Etc
export const PositionResponseEtc = props({
  PositionBase: props({
    AssetType: literal('Etc'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  Costs: PositionCost,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails,
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    MarketValueOpen: number(),
    MarketValueOpenInBaseCurrency: number(),
    ProfitLossCurrencyConversion: optional(number()),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    ProfitLossOnTradeIntraday: number(),
    ProfitLossOnTradeIntradayInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: number(),
  }),
})

export interface PositionResponseEtc extends GuardType<typeof PositionResponseEtc> {}
// #endregion

// #region Etf
export const PositionResponseEtf = props({
  PositionBase: props({
    AssetType: literal('Etf'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  Costs: PositionCost,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails,
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    MarketValueOpen: number(),
    MarketValueOpenInBaseCurrency: number(),
    ProfitLossCurrencyConversion: optional(number()),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    ProfitLossOnTradeIntraday: number(),
    ProfitLossOnTradeIntradayInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: number(),
  }),
})

export interface PositionResponseEtf extends GuardType<typeof PositionResponseEtf> {}
// #endregion

// #region Etn
export const PositionResponseEtn = props({
  PositionBase: props({
    AssetType: literal('Etn'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  Costs: PositionCost,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails,
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    MarketValueOpen: number(),
    MarketValueOpenInBaseCurrency: number(),
    ProfitLossCurrencyConversion: optional(number()),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    ProfitLossOnTradeIntraday: number(),
    ProfitLossOnTradeIntradayInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: number(),
  }),
})

export interface PositionResponseEtn extends GuardType<typeof PositionResponseEtn> {}
// #endregion

// #region Fund
export const PositionResponseFund = props({
  PositionBase: props({
    AssetType: literal('Fund'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  Costs: PositionCost,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails,
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    MarketValueOpen: number(),
    MarketValueOpenInBaseCurrency: number(),
    ProfitLossCurrencyConversion: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    ProfitLossOnTradeIntraday: number(),
    ProfitLossOnTradeIntradayInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: number(),
  }),
})

export interface PositionResponseFund extends GuardType<typeof PositionResponseFund> {}
// #endregion

// #region FxForwards
export const PositionResponseFxForwards = props({
  PositionBase: props({
    AssetType: literal('FxForwards'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    OpenSwap: optional(number()),
    SourceOrderId: string(),
    SpotDate: string({ format: 'date-iso8601' }),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  Costs: PositionCost,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails,
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    Ask: number(),
    Bid: number(),
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
  }),
})

export interface PositionResponseFxForwards extends GuardType<typeof PositionResponseFxForwards> {}
// #endregion

// #region FxSpot
export const PositionResponseFxSpot = props({
  PositionBase: props({
    AssetType: literal('FxSpot'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    SpotDate: string({ format: 'date-iso8601' }),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  Costs: PositionCost,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails,
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    Ask: number(),
    Bid: number(),
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    ProfitLossOnTradeIntraday: number(),
    ProfitLossOnTradeIntradayInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
  }),
})

export interface PositionResponseFxSpot extends GuardType<typeof PositionResponseFxSpot> {}
// #endregion

// #region Stock
export const PositionResponseStock = props({
  PositionBase: props({
    AssetType: literal('Stock'),

    AccountId: string(),
    AccountKey: string(),
    Amount: number(),
    CanBeClosed: boolean(),
    ClientId: string(),
    CloseConversionRateSettled: boolean(),
    CorrelationKey: string(),
    ExecutionTimeOpen: string({ format: 'date-iso8601' }),
    ExternalReference: optional(string()),
    IsForceOpen: boolean(),
    IsMarketOpen: boolean(),
    LockedByBackOffice: boolean(),
    OpenIndexRatio: optional(number()),
    OpenPrice: number(),
    OpenPriceIncludingCosts: number(),
    SourceOrderId: string(),
    Status: PositionStatus,
    Uic: integer(),
    ValueDate: string({ format: 'date-iso8601' }),
  }),
  Costs: PositionCost,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails,
  NetPositionId: string(),
  PositionId: string(),
  PositionView: props({
    Ask: optional(number()),
    Bid: optional(number()),
    CalculationReliability: CalculationReliability,
    ConversionRateCurrent: number(),
    ConversionRateOpen: number(),
    CurrentPrice: number(),
    CurrentPriceDelayMinutes: integer(),
    CurrentPriceLastTraded: optional(string({ format: 'date-iso8601' })),
    CurrentPriceType: PriceType,
    Exposure: number(),
    ExposureCurrency: Currency3,
    ExposureInBaseCurrency: number(),
    IndexRatio: optional(number()),
    InstrumentPriceDayPercentChange: number(),
    MarketState: MarketState,
    MarketValue: number(),
    MarketValueInBaseCurrency: number(),
    MarketValueOpen: number(),
    MarketValueOpenInBaseCurrency: number(),
    ProfitLossCurrencyConversion: optional(number()),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    ProfitLossOnTradeIntraday: number(),
    ProfitLossOnTradeIntradayInBaseCurrency: number(),
    TradeCostsTotal: number(),
    TradeCostsTotalInBaseCurrency: number(),
    UnderlyingCurrentPrice: number(),
  }),
})

export interface PositionResponseStock extends GuardType<typeof PositionResponseStock> {}
// #endregion

// #region Unknown
export const PositionResponseUnknown = props({
  PositionBase: props({
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
    ExternalReference: optional(string()),
  }, { extendable: true }),
  PositionId: string(),
}, { extendable: true })

export interface PositionResponseUnknown extends GuardType<typeof PositionResponseUnknown> {}
// #endregion

export const PositionResponseUnion = union([
  PositionResponseBond,
  PositionResponseCfdOnEtc,
  PositionResponseCfdOnEtf,
  PositionResponseCfdOnEtn,
  PositionResponseCfdOnFund,
  PositionResponseCfdOnFutures,
  PositionResponseCfdOnIndex,
  PositionResponseCfdOnStock,
  PositionResponseContractFutures,
  PositionResponseEtc,
  PositionResponseEtf,
  PositionResponseEtn,
  PositionResponseFund,
  PositionResponseFxForwards,
  PositionResponseFxSpot,
  PositionResponseStock,
  PositionResponseUnknown,
])

export type PositionResponseUnion =
  | PositionResponseBond
  | PositionResponseCfdOnEtc
  | PositionResponseCfdOnEtf
  | PositionResponseCfdOnEtn
  | PositionResponseCfdOnFund
  | PositionResponseCfdOnFutures
  | PositionResponseCfdOnIndex
  | PositionResponseCfdOnStock
  | PositionResponseContractFutures
  | PositionResponseEtc
  | PositionResponseEtf
  | PositionResponseEtn
  | PositionResponseFund
  | PositionResponseFxForwards
  | PositionResponseFxSpot
  | PositionResponseStock
  | PositionResponseUnknown
