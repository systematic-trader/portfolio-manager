import {
  array,
  boolean,
  type GuardType,
  literal,
  number,
  optional,
  props,
  tuple,
  unknown,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derives/currency.ts'
import { CurrencyConversion } from './currency-conversion.ts'
import { Exposure } from './exposure.ts'
import { Fee } from './fee.ts'
import { FinancingInterest } from './financing-interest.ts'
import { ForexPriceBand } from './forex-price-band.ts'
import { MarginTierRequirement } from './margin-tier-requirement.ts'
import { OrderAction } from './order-action.ts'
import { SwapPoints } from './swap-points.ts'
import { TradingConditionExchangeFeeRule } from './trading-condition-exchange-fee-rule.ts'
import { TradingConditionRule } from './trading-condition-rule.ts'

// #region FxSpot
export const InstrumentTradingConditionsFxSpot = props({
  AccountCurrency: Currency3,
  AccumulatedVolume: number(),
  AmountCurrency: Currency3,
  ApplicableFxCommissionRate: number(),
  AssetType: literal('FxSpot'),
  CommissionLimits: array(props({
    BaseCommission: optional(number()),
    Currency: Currency3,
    MaxAmount: optional(number()),
    MinAmount: optional(number()),
    OrderAction,
  })),
  CurrencyConversion: optional(CurrencyConversion),
  CurrentSpread: number(),
  ExposureLimits: array(Exposure),
  FinancingInterest,
  ForexPriceBands: array(ForexPriceBand),
  FxSpotMaxOrderAutoPlaceAmount: number(),
  FxSpotMaxStreamingAmount: number(),
  InstrumentCurrency: Currency3,
  IsTradable: boolean(),
  MarginTierRequirement,
  MinOrderSize: number(),
  MinOrderSizeCurrency: Currency3,
  ScheduledTradingConditions: optional(unknown()),
  SpreadAsLowAs: number(),
  SwapPoints,
  TicketFee: Fee,
  TicketFeeThreshold: number(),
  Uic: number(),
})

export interface InstrumentTradingConditionsFxSpot extends GuardType<typeof InstrumentTradingConditionsFxSpot> {}
// #endregion

// #region Stock
export const InstrumentTradingConditionsStock = props({
  AccountCurrency: Currency3,
  AmountCurrency: Currency3,
  AssetType: literal('Stock'),
  CollateralValue: number(),
  CommissionLimits: tuple([props({
    Currency: Currency3,
    MaxCommission: optional(number()),
    MinCommission: number(),
    OrderAction: OrderAction.extract(['ExecuteOrder']),
    PerUnitRate: optional(number()),
    RateOnAmount: optional(number()),
  })]),
  CurrencyConversion: optional(CurrencyConversion),
  CurrentSpread: number(),
  ExchangeFeeRules: optional(array(TradingConditionExchangeFeeRule)),
  HasKID: boolean(),
  InitialCollateralValue: number(),
  InstrumentCurrency: Currency3,
  InternalCosts: optional(props({
    IncidentalCost: props({
      CostPct: number(),
    }),
    PortfolioCost: props({
      CostPct: number(),
    }),
  })),
  IsSrdEligible: boolean(),
  IsTradable: boolean(),
  MaintenanceCollateralValue: number(),
  MaximumCollateralAmount: number(),
  MinOrderSize: optional(number()),
  MinOrderSizeCurrency: optional(Currency3),
  Rating: number(),
  Rules: optional(array(TradingConditionRule)),
  ScheduledTradingConditions: optional(unknown()),
  Uic: number(),
  VatOnCustodyFeePct: number(),
})

export interface InstrumentTradingConditionsStock extends GuardType<typeof InstrumentTradingConditionsStock> {}
// #endregion

export const InstrumentTradingConditions = {
  FxSpot: InstrumentTradingConditionsFxSpot,
  Stock: InstrumentTradingConditionsStock,
} as const

export type InstrumentTradingConditions = {
  FxSpot: InstrumentTradingConditionsFxSpot
  Stock: InstrumentTradingConditionsStock
}
