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
import { MarketState } from '../derives/market-state.ts'
import { NonTradableReason } from '../derives/non-tradable-reason.ts'
import { PositionStatus } from '../derives/position-status.ts'
import { ShortTrading } from '../derives/short-trading.ts'
import { TradingStatus } from '../derives/trading-status.ts'
import { FixedIncomeData } from './fixed-income-data.ts'
import { OptionsData } from './options-data.ts'

export interface NetPositionStatic extends GuardType<typeof NetPositionStatic> {}

export const NetPositionStatic = props({
  /** The id of the account to which the net position belongs */
  AccountId: optional(string()),

  /** Sum volume of positions in instrument */
  Amount: number(),

  /** Sum of volume positions that are long */
  AmountLong: number(),

  /** Sum of volume positions that are short */
  AmountShort: number(),

  /** The AssetType */
  AssetType: AssetType, // todo this probably determines which fields are present

  /** Stock blocking Quantity */
  BlockedQuantity: optional(number()),

  /** Indicates if the net position may be closed */
  CanBeClosed: boolean(),

  /** The id of the client to which the net position belongs */
  ClientId: string(),

  /** The ExpiryDate */
  ExpiryDate: optional(string({ format: 'date-iso8601' })),

  /** Information specific to fixed income products */
  FixedIncomeData: optional(FixedIncomeData),

  /** If true, Underlying position(s) having ForceOpen position(s) */
  HasForceOpenPositions: boolean(),

  /** True if the instrument is currently tradable on its exchange */
  IsMarketOpen: boolean(),

  /** Market state of exchange for instrument */
  MarketState: MarketState,

  /** Non tradable reason */
  NonTradableReason: NonTradableReason,

  /**
   * Futures only.
   * The date on which the owner may be required to take physical delivery of the instrument commodity.
   */
  NoticeDate: optional(string({ format: 'date-iso8601' })),

  /** The number of related orders to positions under this NetPosition */
  NumberOfRelatedOrders: integer(),

  /** Open IndexRatio, Applicable for Inflation linked bonds */
  OpenIndexRatioAverage: optional(number()),

  /** Open Ipo order(s) count */
  OpenIpoOrdersCount: integer(),

  /** Open order(s) Count */
  OpenOrdersCount: integer(),

  /** Open Trigger order(s) Count */
  OpenTriggerOrdersCount: integer(),

  /** Details for options, warrants and structured products */
  OptionsData: optional(OptionsData),

  /**
   * If all underlying positions are on the same account then this is the account.
   * If not, it is omitted.
   */
  PositionsAccount: optional(string()),

  /** Short trading allowed or not on instrument */
  ShortTrading: optional(ShortTrading),

  /**
   * The accountid of the first and only position.
   * Omitted if the net position has more than one underlying position.
   */
  SinglePositionAccountId: optional(string()),

  /**
   * Unique id of the first and only position.
   * Omitted if the net position has more than one underlying position.
   */
  SinglePositionId: optional(string()),

  /**
   * The status of the first and only position.
   * Omitted if the net position has more than one underlying position.
   */
  SinglePositionStatus: optional(PositionStatus),

  /** SRD Last Trade Date */
  SrdLastTradeDate: optional(string({ format: 'date-iso8601' })),

  /** SRD Settlement Date */
  SrdSettlementDate: optional(string({ format: 'date-iso8601' })),

  /** Instrument is tradable or not */
  TradingStatus: TradingStatus,

  /** Unique id of the instrument */
  Uic: integer(),

  /** The value date of the net position */
  ValueDate: optional(string({ format: 'date-iso8601' })),

  /** Not documented */
  OpeningDirection: BuySell,
})
