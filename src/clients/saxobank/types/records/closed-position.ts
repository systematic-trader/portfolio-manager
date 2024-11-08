import {
  boolean,
  type GuardType,
  integer,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType } from '../derives/asset-type.ts'
import { BuySell } from '../derives/buy-sell.ts'
import { PositionClosingMethod } from '../derives/position-closing-method.ts'
import { FXOptionsBaseData } from './fx-options-base-data.ts'

export interface ClosedPosition extends GuardType<typeof ClosedPosition> {}

export const ClosedPosition = props({
  /** The id of the account to which the closed position belongs */
  AccountId: string(),

  /** Sum volume of positions in instrument */
  Amount: number(),

  /** The AssetType */
  AssetType: AssetType, // todo this probabilly determines if other fields are present - the guard should reflect this

  /** Closing direction - Buy or Sell */
  BuyOrSell: BuySell,

  /** The id of the client to which the closed position belongs */
  ClientId: string(),

  /** Closed ProfitLoss in Instrument currency */
  ClosedProfitLoss: number(),

  /** Closed ProfitLoss in Base (client/ account) currency */
  ClosedProfitLossInBaseCurrency: number(),

  /** Closing IndexRatio, Applicable for Inflation linked bonds */
  ClosingIndexRatio: optional(number()),

  /** Market value at closing for non-options in instrument currency */
  ClosingMarketValue: number(),

  /** Market value at closing for non-options in base currency */
  ClosingMarketValueInBaseCurrency: number(),

  /**
   * The closing method of the position.
   * Possible values: Explicit, Fifo.
   */
  ClosingMethod: PositionClosingMethod,

  /** The Id of closing position that caused closing */
  ClosingPositionId: string(),

  /** Premium for option positions that are closed, in instrument currency */
  ClosingPremium: optional(number()),

  /** Premium for option positions that are closed, in base currency */
  ClosingPremiumInBaseCurrency: optional(number()),

  /** Closing price */
  ClosingPrice: number(),

  /**
   * True when the closing trades currency conversion rate has been settled (i.e. is fixed and not fluctuating).
   * This is the case for accounts using Market Conversion-Rates.
   */
  ConversionRateInstrumentToBaseSettledClosing: boolean(),

  /**
   * True when the opening trades currency conversion rate has been settled (i.e. is fixed and not fluctuating).
   * This is the case for accounts using Market Conversion-Rates.
   */
  ConversionRateInstrumentToBaseSettledOpening: boolean(),

  /** Total Cost in instrument currency */
  CostClosing: number(),

  /** Total Cost in client/account currency */
  CostClosingInBaseCurrency: number(),

  /** Total Cost in instrument currency */
  CostOpening: number(),

  /** Total Cost in client/account currency */
  CostOpeningInBaseCurrency: number(),

  /** The UTC date and time the position was closed */
  ExecutionTimeClose: string({ format: 'date-iso8601' }),

  /** The UTC date and time the position was opened */
  ExecutionTimeOpen: string({ format: 'date-iso8601' }),

  /** The ExpiryDate */
  ExpiryDate: optional(string({ format: 'date-iso8601' })),

  /** Fx option-related data. Only for fx options. */
  FxOptionData: optional(FXOptionsBaseData),

  /** Futures only - The date on which the owner may be required to take physical delivery of the instrument commodity */
  NoticeDate: optional(string({ format: 'date-iso8601' })),

  /** Opening IndexRatio, Applicable for Inflation linked bonds */
  OpeningIndexRatio: optional(number()),

  /** The Id of opening position that has been closed */
  OpeningPositionId: string(),

  /** The price the instrument was traded at */
  OpenPrice: number(),

  /** The profit loss from currency conversion between position close and position open */
  ProfitLossCurrencyConversion: optional(number()),

  /** The P/L on the trade in the currency in which the instrument is traded */
  ProfitLossOnTrade: optional(number()),

  /** The P/L in the client/account group/account currency */
  ProfitLossOnTradeInBaseCurrency: optional(number()),

  /** SRD Settlement Date */
  SrdSettlementDate: optional(string({ format: 'date-iso8601' })),

  /** Unique id of the instrument */
  Uic: integer(),
})
