import {
  type GuardType,
  integer,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { CalculationReliability } from '../derives/calculation-reliability.ts'
import { Currency3 } from '../derives/currency.ts'
import { PositionStatus } from '../derives/position-status.ts'
import { PriceType } from '../derives/price-type.ts'
import { SettlementInstructions } from './settlement-instructions.ts'

export interface NetPositionDynamic extends GuardType<typeof NetPositionDynamic> {}

export const NetPositionDynamic = props({
  /** The current market ask price */
  Ask: optional(number()),

  /** The average price of all the open positions that make up the net position */
  AverageOpenPrice: number(),

  /** The current market bid price */
  Bid: optional(number()),

  /** If an error was encountered this code indicates source of the calculation error */
  CalculationReliability: CalculationReliability,

  /** Current conversion rate used for opening trade costs */
  ConversionRateCurrent: optional(number()),

  /** The user specific(delayed/realtime) current market price of the instrument */
  CurrentPrice: number(),

  /** If set, it defines the number of minutes by which the price is delayed */
  CurrentPriceDelayMinutes: integer(),

  /** Indicates when the user specific current market price of the instrument was last traded */
  CurrentPriceLastTraded: optional(string({ format: 'date-iso8601' })),

  /**
   * The price type (Bid/Ask/LastTraded) of the user specific(delayed/realtime) current market price of the instrument.
   */
  CurrentPriceType: PriceType,

  /**
   * Current nominal value of position, but differs from market value in that it has a value for margin products.
   */
  Exposure: number(),

  /** Currency of exposure */
  ExposureCurrency: Currency3,

  /**
   * Current nominal value of position, but differs from market value in that it has a value for margin products.
   * Converted to requesting account/client currency.
   */
  ExposureInBaseCurrency: number(),

  /** Current IndexRatio, Applicable for Inflation linked bonds */
  IndexRatio: optional(number()),

  /** Percent change in instrument's price between Previous Close and current Last Traded price */
  InstrumentPriceDayPercentChange: number(),

  /** Sum market value of positions excl. closing costs */
  MarketValue: optional(number()),

  /** The total nominal value of the of the underlying positions, in rquested acount/client currency */
  MarketValueInBaseCurrency: optional(number()),

  /** The value of the position at time of opening */
  MarketValueOpen: optional(number()),

  /** The nominal value of the position at the time of open, in requested account/client currency */
  MarketValueOpenInBaseCurrency: optional(number()),

  /** The total number of contracts that have not been settled and remain open as of the end of a trading day */
  OpenInterest: optional(number()),

  /** The number of Open Positions for this NetPosition */
  PositionCount: integer(),

  /** Simple count of effective open positions under this net position. I.e. without related closing positions */
  PositionsNotClosedCount: integer(),

  /** The P/L from currency conversion between now and position open */
  ProfitLossCurrencyConversion: optional(number()),

  /** The P/L on the trade in the currency in which the instrument is traded */
  ProfitLossOnTrade: number(),

  /** The P/L in the client/account group/account currency */
  ProfitLossOnTradeInBaseCurrency: number(),

  /** If underlying positions are explicitly(only) closed, these are the costs of the closed positions in instrument currency */
  RealizedCostsTotal: optional(number()),

  /** If underlying positions are explicitly(only) closed, these are the costs of the closed positions in client/account group/account currency */
  RealizedCostsTotalInBaseCurrency: optional(number()),

  /** If underlying positions are explicitly(only) closed, this is the sum of realized P/L of the closed positions in instrument currency */
  RealizedProfitLoss: optional(number()),

  /** If underlying positions are explicitly(only) closed, this is the sum of realized P/L of the closed positions in the client/account group/account currency */
  RealizedProfitLossInBaseCurrency: optional(number()),

  /** Settlement Instructions */
  SettlementInstruction: optional(SettlementInstructions),

  /**
   * The status of the net position.
   * Possible values: Open, Closed, Closing, PartiallyClosed, Locked.
   */
  Status: PositionStatus,

  /** The sum of all open costs and realized/unrealized close costs for the underlying positions, in instrument currency */
  TradeCostsTotal: number(),

  /** The sum of all open costs and realized/unrealized close costs for the underlying positions */
  TradeCostsTotalInBaseCurrency: number(),

  /** Underlying current price */
  UnderlyingCurrentPrice: optional(number()),

  /** Not documented */
  AverageOpenPriceIncludingCosts: number(),

  /** Not documented */
  PositionsAverageBuyPrice: number(),

  /** Not documented */
  PositionsAverageSellPrice: number(),
})
