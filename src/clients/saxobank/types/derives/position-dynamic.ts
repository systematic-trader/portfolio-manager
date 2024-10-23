import {
  type GuardType,
  integer,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { CalculationReliability } from './calculation-reliability.ts'
import { MarketState } from './market-state.ts'
import { PriceType } from './price-type.ts'
import { SettlementInstructions } from './settlement-instructions.ts'

export interface PositionDynamic extends GuardType<typeof PositionDynamic> {}

export const PositionDynamic = props({
  /** The current market ask price. */
  Ask: optional(number()),

  /** The current market bid price. */
  Bid: optional(number()),

  /** If an error was encountered this code indicates source of the calculation error. */
  CalculationReliability: CalculationReliability,

  /** Conversion rate used for closing trade costs. */
  ConversionRateClose: optional(number()),

  /** Current conversion rate used for opening trade costs. */
  ConversionRateCurrent: number(),

  /** Conversion rate used for opening trade costs. */
  ConversionRateOpen: number(),

  /** The current price for the instrument */
  CurrentPrice: number(),

  /** If set, it defines the number of minutes by which the price is delayed. */
  CurrentPriceDelayMinutes: integer(),

  /** Indicates when the user specific current market price of the instrument was last traded. */
  CurrentPriceLastTraded: optional(string({ format: 'date-iso8601' })),

  /** The price type (Bid/Ask/LastTraded) of the user specific(delayed/realtime) current market price of the instrument. */
  CurrentPriceType: PriceType,

  /** Current nominal value of position, but differs from market value in that it has a value for margin products. */
  Exposure: number(),

  /** Currency of exposure. */
  ExposureCurrency: string(),

  /** Current nominal value of position, but differs from market value in that it has a value for margin products. Converted to requesting account/client currency. */
  ExposureInBaseCurrency: number(),

  /** Current IndexRatio, Applicable for Inflation linked bonds. */
  IndexRatio: optional(number()),

  /** Percent change in instrument's price between Previous Close and current Last Traded price. */
  InstrumentPriceDayPercentChange: number(),

  MarketState: MarketState,

  /** Market value of position excl. closing costs. */
  MarketValue: number(),

  /** The total nominal value of the of the underlying positions, in requested account/client currency. */
  MarketValueInBaseCurrency: number(),

  /** The value of the position at time of opening. */
  MarketValueOpen: optional(number()),

  /** The nominal value of the position at the time of open, in requested account/client currency. */
  MarketValueOpenInBaseCurrency: optional(number()),

  /** The total number of contracts that have not been settled and remain open as of the end of a trading day. */
  OpenInterest: optional(number()),

  /** The P/L from currency conversion between now and position open. */
  ProfitLossCurrencyConversion: optional(number()),

  /** The P/L in the quote currency. */
  ProfitLossOnTrade: number(),

  /** The P/L on in the client/account base currency. */
  ProfitLossOnTradeInBaseCurrency: number(),

  /** SettlementInstruction */
  SettlementInstruction: optional(SettlementInstructions),

  /** The sum of all open costs and realized/unrealized close costs for the underlying positions, in instrument currency. */
  TradeCostsTotal: number(),

  /** The sum of all open costs and realized/unrealized close costs for the underlying positions. */
  TradeCostsTotalInBaseCurrency: number(),

  /** Underlying current price. */
  UnderlyingCurrentPrice: optional(number()),

  /** Not documented */
  ProfitLossOnTradeIntraday: optional(number()),

  /** Not documented */
  ProfitLossOnTradeIntradayInBaseCurrency: optional(number()),
})
