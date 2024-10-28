import {
  array,
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
import { CalculationReliability } from '../derives/calculation-reliability.ts'
import { CorrelationType } from '../derives/correlation-type.ts'
import { Greeks } from '../derives/greeks.ts'
import { InstrumentDisplayAndFormat } from '../derives/instrument-display-and-format.ts'
import { InstrumentExchangeDetails } from '../derives/instrument-exchange-details.ts'
import { MarketState } from '../derives/market-state.ts'
import { MultiLegOrderDetails } from '../derives/multi-leg-order-details.ts'
import { NonTradableReasons } from '../derives/non-tradable-reasons.ts'
import { OpenOrderRelation } from '../derives/open-order-relation.ts'
import { OrderAmountType } from '../derives/order-amount-type.ts'
import { OrderDuration } from '../derives/order-duration.ts'
import { OrderOptionsData } from '../derives/order-options-data.ts'
import { OrderStatus } from '../derives/order-status.ts'
import { OrderTriggerPriceType } from '../derives/order-trigger-price-type.ts'
import { OrderType } from '../derives/order-type.ts'
import { PriceType } from '../derives/price-type.ts'
import { RelatedOrderInfo } from '../derives/related-order-info.ts'
import { ShortTrading } from '../derives/short-trading.ts'
import { SleepingOrderCondition } from '../derives/sleeping-order-condition.ts'
import { StringStringKeyValuePair } from '../derives/string-string-key-value-pair.ts'
import { ToOpenClose } from '../derives/to-open-close.ts'
import { TradingStatus } from '../derives/trading-status.ts'

export interface OrderResponse extends GuardType<typeof OrderResponse> {}

export const OrderResponse = props({
  /** The id of the account to which the net position belongs. */
  AccountId: string(),

  /** Unique key of the account where the order is placed */
  AccountKey: string(),

  /** Field for adviser to place relevant information. */
  AdviceNote: optional(string()),

  /** Additional order data for algorithmic orders. */
  AlgoOrderData: optional(array(StringStringKeyValuePair)),

  /** Type of algo order strategy. */
  AlgoStrategyName: optional(string()),

  /** Allocation Key */
  AllocationKeyId: optional(string()),

  /** Order size */
  Amount: number(),

  /** The current market ask price. */
  Ask: optional(number()),

  /** The instrument asset type. */
  AssetType: AssetType, // todo this probably determines which of the types are present

  /** The current market bid price. */
  Bid: optional(number()),

  /**
   * Used for conditional BreakoutTrigger orders.
   * Lower trigger price.
   * If the instrument price falls below this level, a stop loss order will be activated.
   */
  BreakoutTriggerDownPrice: optional(number()),

  /**
   * Used for conditional BreakoutTrigger orders.
   * Upper trigger price.
   * If the instrument price exceeds this level, a take profit limit order will be activated.
   */
  BreakoutTriggerUpPrice: optional(number()),

  /** Indicates if the order is Buy Or Sell. */
  BuySell: BuySell,

  /** If an error was encountered this code indicates source of the calculation error. */
  CalculationReliability: CalculationReliability,

  /**
   * The monetary/cash purchase amount, only used when OrderAmountType is ValueInInstrumentCurrency.
   * When set, ignore order Amount.
   */
  CashAmount: optional(number()),

  /** Unique identifier of the client. */
  ClientId: string(),

  /** Unique key of the client where the order is placed */
  ClientKey: string(),

  /** The name of the client. */
  ClientName: string(),

  /** The specific text instructions for the Trading Desk to better understand IAM users intentions for staging the order. */
  ClientNote: optional(string()),

  /** The ID of the position this order was copied from */
  CopiedPositionId: optional(string()),

  /** Correlation key */
  CorrelationKey: string(),

  /** Type of the correlation */
  CorrelationTypes: optional(array(CorrelationType)),

  /** The user specific (delayed/realtime) current market price of the instrument. */
  CurrentPrice: number(),

  /** If set, it defines the number of minutes by which the price is delayed. */
  CurrentPriceDelayMinutes: integer(),

  /** Indicates when the user specific current market price of the instrument was last traded. */
  CurrentPriceLastTraded: optional(string({ format: 'date-iso8601' })),

  /** The price type (Bid/Ask/LastTraded) of the user specific(delayed/realtime) current market price of the instrument. */
  CurrentPriceType: PriceType,

  /** Returns decision maker Id, set when placing orders on behalf of other user */
  DecisionMakerUserId: optional(string()),

  /** Information about the instrument and how to display it. */
  DisplayAndFormat: optional(InstrumentDisplayAndFormat),

  /** Distance to market for this order. (Dynamically updating) */
  DistanceToMarket: optional(number()),

  /**
   * The time frame during which the order is valid.
   * If the OrderDurationType is GTD, then an ExpiryDate must also be provided.
   */
  Duration: OrderDuration,

  /** Information about the instrument's exchange and trading status. */
  Exchange: InstrumentExchangeDetails,

  /** The ExpiryDate. Valid for options and futures. */
  ExpiryDate: optional(string({ format: 'date-iso8601' })),

  /** Gets or sets the Client order reference id. */
  ExternalReference: optional(string()),

  /** The amount of the order, which has already been filled, in case of partial fills. */
  FilledAmount: optional(number()),

  /** Greeks for option(s) i.e. FX Option, Contract Options and Contract Options CFD . */
  Greeks: optional(Greeks),

  /** Financing Amount Pct for IPO orders */
  IpoFinancingAmountPct: optional(number()),

  /** Subscription fee for IPO orders */
  IpoSubscriptionFee: number(),

  /** If True, the order's resulting position will not automatically be netted with position(s) in the opposite direction */
  IsForceOpen: boolean(),

  /** True if the instrument is currently tradable on its exchange. */
  IsMarketOpen: boolean(),

  /** Current trading price of instrument. (Dynamically updating) */
  MarketPrice: number(),

  /** Market state of exchange for instrument */
  MarketState: MarketState,

  /** Market value of position excl. closing costs. */
  MarketValue: optional(number()),

  /** Common properties for multi-leg (strategy) orders. */
  MultiLegOrderDetails: optional(MultiLegOrderDetails),

  /** Non tradable reason. */
  NonTradableReason: NonTradableReasons,

  /** The total number of contracts that have not been settled and remain open as of the end of a trading day. */
  OpenInterest: optional(number()),

  /** Specifies the Order Type. */
  OpenOrderType: OrderType,

  /** Details for options, warrants and structured products. */
  OptionsData: optional(OrderOptionsData),

  /** Indicates if the order Amount is specified as lots/shares/contracts or as a monetary purchase amount in instrument currency. */
  OrderAmountType: OrderAmountType,

  /** Unique Id of the order. */
  OrderId: string(),

  /** Relation to other active orders. */
  OrderRelation: OpenOrderRelation,

  /** The UTC date and time the order was placed */
  OrderTime: string({ format: 'date-iso8601' }),

  /**
   * Client id of the client's owner.
   * Only set when relevant.
   */
  OwnerId: optional(string()),

  /** Price at which the order is triggered. */
  Price: optional(number()),

  /**
   * List of information about related open orders.
   * There should be enough information that the UI can show the price of the order, and calculate distance to market. */
  RelatedOpenOrders: optional(array(RelatedOrderInfo)),

  /** Id of the related position. */
  RelatedPositionId: optional(string()),

  /** Short trading allowed or not on instrument */
  ShortTrading: optional(ShortTrading),

  /** Represent the condition on sleeping order. */
  SleepingOrderCondition: optional(SleepingOrderCondition),

  /** Current status of the order */
  Status: OrderStatus,

  /** Secondary price level for StopLimit orders. */
  StopLimitPrice: optional(number()),

  /** Name of 'SwitchInstrumentUic'. */
  SwitchInstrumentName: optional(string()),

  /**
   * Mutual funds only.
   * When set, instructs the order is to switch (transfer) the value of a matching open position into the specified "switch" instrument (UIC). */
  SwitchInstrumentUic: optional(integer()),

  /** Whether the position should be created to open/increase or close/decrease a position. */
  ToOpenClose: optional(ToOpenClose),

  /** The ID of the TradeMaker recommendation. */
  TradeIdeaId: optional(string()),

  /** Instrument is tradable or not */
  TradingStatus: TradingStatus,

  /** Distance to market for a trailing stop order. */
  TrailingStopDistanceToMarket: optional(number()),

  /** Step size for trailing stop order. */
  TrailingStopStep: optional(number()),

  /** Order id of related conditional order that controls placement/activation of this order. */
  TriggerParentOrderId: optional(string()),

  /** Type of price chosen to trigger a conditional order. */
  TriggerPriceType: optional(OrderTriggerPriceType),

  /** Unique Id of the instrument */
  Uic: integer(),

  /** The value date (only for FxForwards). */
  ValueDate: optional(string({ format: 'date-iso8601' })),

  /** Not documented */
  IsExtendedHoursEnabled: boolean(),
})
