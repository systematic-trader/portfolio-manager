import {
  boolean,
  type GuardType,
  literal,
  number,
  optional,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType } from '../derives/asset-type.ts'
import { BuySell } from '../derives/buy-sell.ts'
import { PositionClosingMethod } from '../derives/position-closing-method.ts'
import { InstrumentDisplayAndFormat } from './instrument-display-and-format.ts'
import { InstrumentExchangeDetails } from './instrument-exchange-details.ts'

const Exchange = props({
  Description: optional(string()),
  ExchangeId: optional(string()),
  IsOpen: boolean(),
  TimeZoneId: string(),
})

// #region Bond
export const ClosedPositionResponseBond = props({
  ClosedPosition: props({
    AssetType: literal('Bond'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    CostClosing: number(),
    CostClosingInBaseCurrency: number(),
    CostOpening: number(),
    CostOpeningInBaseCurrency: number(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    ExpiryDate: string({ format: 'date-iso8601' }),
    OpeningPositionId: string(),
    OpenPrice: number(),
    ProfitLossCurrencyConversion: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseBond extends GuardType<typeof ClosedPositionResponseBond> {}
// #endregion

// #region CfdOnEtc
export const ClosedPositionResponseCfdOnEtc = props({
  ClosedPosition: props({
    AssetType: literal('CfdOnEtc'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    CostClosing: number(),
    CostClosingInBaseCurrency: number(),
    CostOpening: number(),
    CostOpeningInBaseCurrency: number(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    OpenPrice: number(),
    OpeningPositionId: string(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseCfdOnEtc extends GuardType<typeof ClosedPositionResponseCfdOnEtc> {}
// #endregion

// #region CfdOnEtf
export const ClosedPositionResponseCfdOnEtf = props({
  ClosedPosition: props({
    AssetType: literal('CfdOnEtf'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    CostClosing: number(),
    CostClosingInBaseCurrency: number(),
    CostOpening: number(),
    CostOpeningInBaseCurrency: number(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    OpenPrice: number(),
    OpeningPositionId: string(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseCfdOnEtf extends GuardType<typeof ClosedPositionResponseCfdOnEtf> {}
// #endregion

// #region CfdOnEtn
export const ClosedPositionResponseCfdOnEtn = props({
  ClosedPosition: props({
    AssetType: literal('CfdOnEtn'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    CostClosing: number(),
    CostClosingInBaseCurrency: number(),
    CostOpening: number(),
    CostOpeningInBaseCurrency: number(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    OpenPrice: number(),
    OpeningPositionId: string(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseCfdOnEtn extends GuardType<typeof ClosedPositionResponseCfdOnEtn> {}
// #endregion

// #region CfdOnFund
export const ClosedPositionResponseCfdOnFund = props({
  ClosedPosition: props({
    AssetType: literal('CfdOnFund'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    CostClosing: number(),
    CostClosingInBaseCurrency: number(),
    CostOpening: number(),
    CostOpeningInBaseCurrency: number(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    OpenPrice: number(),
    OpeningPositionId: string(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseCfdOnFund extends GuardType<typeof ClosedPositionResponseCfdOnFund> {}
// #endregion

// #region CfdOnFutures
export const ClosedPositionResponseCfdOnFutures = props({
  ClosedPosition: props({
    AssetType: literal('CfdOnFutures'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    ExpiryDate: string({ format: 'date-iso8601' }),
    OpeningPositionId: string(),
    OpenPrice: number(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange: InstrumentExchangeDetails.merge({
    ExchangeId: optional(string()),
    Description: optional(string()),
  }),
  NetPositionId: string(),
})

export interface ClosedPositionResponseCfdOnFutures extends GuardType<typeof ClosedPositionResponseCfdOnFutures> {}
// #endregion

// #region CfdOnIndex
export const ClosedPositionResponseCfdOnIndex = props({
  ClosedPosition: props({
    AssetType: literal('CfdOnIndex'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    OpenPrice: number(),
    OpeningPositionId: string(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseCfdOnIndex extends GuardType<typeof ClosedPositionResponseCfdOnIndex> {}
// #endregion

// #region CfdOnStock
export const ClosedPositionResponseCfdOnStock = props({
  ClosedPosition: props({
    AssetType: literal('CfdOnStock'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    CostClosing: number(),
    CostClosingInBaseCurrency: number(),
    CostOpening: number(),
    CostOpeningInBaseCurrency: number(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    OpenPrice: number(),
    OpeningPositionId: string(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseCfdOnStock extends GuardType<typeof ClosedPositionResponseCfdOnStock> {}
// #endregion

// #region ContractFutures
export const ClosedPositionResponseContractFutures = props({
  ClosedPosition: props({
    AssetType: literal('ContractFutures'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    CostClosing: number(),
    CostClosingInBaseCurrency: number(),
    CostOpening: number(),
    CostOpeningInBaseCurrency: number(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    ExpiryDate: string({ format: 'date-iso8601' }),
    NoticeDate: optional(string({ format: 'date-iso8601' })),
    OpeningPositionId: string(),
    OpenPrice: number(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseContractFutures
  extends GuardType<typeof ClosedPositionResponseContractFutures> {}
// #endregion

// #region Etc
export const ClosedPositionResponseEtc = props({
  ClosedPosition: props({
    AssetType: literal('Etc'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    CostClosing: number(),
    CostClosingInBaseCurrency: number(),
    CostOpening: number(),
    CostOpeningInBaseCurrency: number(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    OpenPrice: number(),
    OpeningPositionId: string(),
    ProfitLossCurrencyConversion: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseEtc extends GuardType<typeof ClosedPositionResponseEtc> {}
// #endregion

// #region Etf
export const ClosedPositionResponseEtf = props({
  ClosedPosition: props({
    AssetType: literal('Etf'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    CostClosing: number(),
    CostClosingInBaseCurrency: number(),
    CostOpening: number(),
    CostOpeningInBaseCurrency: number(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    OpenPrice: number(),
    OpeningPositionId: string(),
    ProfitLossCurrencyConversion: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseEtf extends GuardType<typeof ClosedPositionResponseEtf> {}
// #endregion

// #region Etn
export const ClosedPositionResponseEtn = props({
  ClosedPosition: props({
    AssetType: literal('Etn'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    CostClosing: number(),
    CostClosingInBaseCurrency: number(),
    CostOpening: number(),
    CostOpeningInBaseCurrency: number(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    OpenPrice: number(),
    OpeningPositionId: string(),
    ProfitLossCurrencyConversion: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseEtn extends GuardType<typeof ClosedPositionResponseEtn> {}
// #endregion

// #region Fund
export const ClosedPositionResponseFund = props({
  ClosedPosition: props({
    AssetType: literal('Fund'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    CostClosing: number(),
    CostClosingInBaseCurrency: number(),
    CostOpening: number(),
    CostOpeningInBaseCurrency: number(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    OpenPrice: number(),
    OpeningPositionId: string(),
    ProfitLossCurrencyConversion: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseFund extends GuardType<typeof ClosedPositionResponseFund> {}
// #endregion

// #region FxForwards
export const ClosedPositionResponseFxForwards = props({
  ClosedPosition: props({
    AssetType: literal('FxForwards'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    CostClosing: number(),
    CostClosingInBaseCurrency: number(),
    CostOpening: number(),
    CostOpeningInBaseCurrency: number(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    OpenPrice: number(),
    OpeningPositionId: string(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseFxForwards extends GuardType<typeof ClosedPositionResponseFxForwards> {}
// #endregion

// #region FxSpot
export const ClosedPositionResponseFxSpot = props({
  ClosedPosition: props({
    AssetType: literal('FxSpot'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    CostClosing: number(),
    CostClosingInBaseCurrency: number(),
    CostOpening: number(),
    CostOpeningInBaseCurrency: number(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    OpenPrice: number(),
    OpeningPositionId: string(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseFxSpot extends GuardType<typeof ClosedPositionResponseFxSpot> {}
// #endregion

// #region Stock
export const ClosedPositionResponseStock = props({
  ClosedPosition: props({
    AssetType: literal('Stock'),

    AccountId: string(),
    Amount: number(),
    BuyOrSell: BuySell,
    ClientId: string(),
    ClosedProfitLoss: number(),
    ClosedProfitLossInBaseCurrency: number(),
    ClosingMarketValue: number(),
    ClosingMarketValueInBaseCurrency: number(),
    ClosingMethod: PositionClosingMethod,
    ClosingPositionId: string(),
    ClosingPrice: number(),
    ConversionRateInstrumentToBaseSettledClosing: boolean(),
    ConversionRateInstrumentToBaseSettledOpening: boolean(),
    CostClosing: number(),
    CostClosingInBaseCurrency: number(),
    CostOpening: number(),
    CostOpeningInBaseCurrency: number(),
    ExecutionTimeClose: string(),
    ExecutionTimeOpen: string(),
    OpenPrice: number(),
    OpeningPositionId: string(),
    ProfitLossCurrencyConversion: number(),
    ProfitLossOnTrade: number(),
    ProfitLossOnTradeInBaseCurrency: number(),
    Uic: number(),
  }),
  ClosedPositionUniqueId: string(),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Exchange,
  NetPositionId: string(),
})

export interface ClosedPositionResponseStock extends GuardType<typeof ClosedPositionResponseStock> {}
// #endregion

// #region Unknown
export const ClosedPositionResponseUnknown = props({
  ClosedPosition: props({
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
  ClosedPositionUniqueId: string(),
  NetPositionId: string(),
}, { extendable: true })

export interface ClosedPositionResponseUnknown extends GuardType<typeof ClosedPositionResponseUnknown> {}
// #endregion

export const ClosedPositionResponseUnion = union([
  ClosedPositionResponseBond,
  ClosedPositionResponseCfdOnEtc,
  ClosedPositionResponseCfdOnEtf,
  ClosedPositionResponseCfdOnEtn,
  ClosedPositionResponseCfdOnFund,
  ClosedPositionResponseCfdOnFutures,
  ClosedPositionResponseCfdOnIndex,
  ClosedPositionResponseCfdOnStock,
  ClosedPositionResponseContractFutures,
  ClosedPositionResponseEtc,
  ClosedPositionResponseEtf,
  ClosedPositionResponseEtn,
  ClosedPositionResponseFund,
  ClosedPositionResponseFxForwards,
  ClosedPositionResponseFxSpot,
  ClosedPositionResponseStock,
  ClosedPositionResponseUnknown,
])

export type ClosedPositionResponseUnion =
  | ClosedPositionResponseBond
  | ClosedPositionResponseCfdOnEtc
  | ClosedPositionResponseCfdOnEtf
  | ClosedPositionResponseCfdOnEtn
  | ClosedPositionResponseCfdOnFund
  | ClosedPositionResponseCfdOnFutures
  | ClosedPositionResponseCfdOnIndex
  | ClosedPositionResponseCfdOnStock
  | ClosedPositionResponseContractFutures
  | ClosedPositionResponseEtc
  | ClosedPositionResponseEtf
  | ClosedPositionResponseEtn
  | ClosedPositionResponseFund
  | ClosedPositionResponseFxForwards
  | ClosedPositionResponseFxSpot
  | ClosedPositionResponseStock
  | ClosedPositionResponseUnknown
