import {
  boolean,
  type GuardType,
  integer,
  number,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType } from '../derives/asset-type.ts'
import { BuySell } from '../derives/buy-sell.ts'
import { CalculationReliability } from '../derives/calculation-reliability.ts'
import { MarketState } from '../derives/market-state.ts'
import { NonTradableReason } from '../derives/non-tradable-reason.ts'
import { OpenOrderRelation } from '../derives/open-order-relation.ts'
import { OrderAmountType } from '../derives/order-amount-type.ts'
import { OrderStatus } from '../derives/order-status.ts'
import { OrderTriggerPriceType } from '../derives/order-trigger-price-type.ts'
import { OrderType } from '../derives/order-type.ts'
import { PriceType } from '../derives/price-type.ts'
import { ToOpenClose } from '../derives/to-open-close.ts'
import { InstrumentDisplayAndFormat } from './instrument-display-and-format.ts'
import { InstrumentExchangeDetails } from './instrument-exchange-details.ts'
import { OrderDuration } from './order-duration.ts'

export interface SleepingOrderCondition extends GuardType<typeof SleepingOrderCondition> {}

export const SleepingOrderCondition = props({
  /** Order size */
  Amount: number(),

  /** The instrument asset type. */
  AssetType: AssetType, // todo this probably determines which of the types are present

  /** Used for conditional BreakoutTrigger orders. Lower trigger price. If the instrument price falls below this level, a stop loss order will be activated. */
  BreakoutTriggerDownPrice: number(),

  /** Used for conditional BreakoutTrigger orders. Upper trigger price. If the instrument price exceeds this level, a take profit limit order will be activated. */
  BreakoutTriggerUpPrice: number(),

  /** Indicates if the order is Buy Or Sell. */
  BuySell: BuySell,

  /** If an error was encountered this code indicates source of the calculation error. */
  CalculationReliability: CalculationReliability,

  /** Unique Id of the Condition. */
  ConditionId: string(),

  /** The ID of the position this order was copied from */
  CopiedPositionId: string(),

  /** The user specific(delayed/realtime) current market price of the instrument. */
  CurrentPrice: number(),

  /** If set, it defines the number of minutes by which the price is delayed. */
  CurrentPriceDelayMinutes: integer(),

  /** The price type (Bid/Ask/LastTraded) of the user specific(delayed/realtime) current market price of the instrument. */
  CurrentPriceType: PriceType,

  /** Information about the instrument and how to display it. */
  DisplayAndFormat: InstrumentDisplayAndFormat,

  /** Distance to market for this order. (Dynamically updating) */
  DistanceToMarket: number(),

  /** The time frame during which the order is valid. If the OrderDurationType is GTD, then an ExpiryDate must also be provided. */
  Duration: OrderDuration,

  /** Information about the instrument's exchange and trading status. */
  Exchange: InstrumentExchangeDetails,

  /** The ExpiryDate. Valid for options and futures. */
  ExpiryDate: string({ format: 'date-iso8601' }),

  /** If True, the order's resulting position will not automatically be netted with position(s) in the opposite direction */
  IsForceOpen: boolean(),

  /** True if the instrument is currently tradable on its exchange. */
  IsMarketOpen: boolean(),

  /** Current trading price of instrument. (Dynamically updating) */
  MarketPrice: number(),

  /** Market state of exchange for instrument */
  MarketState: MarketState,

  /** Non tradable reason. */
  NonTradableReason: NonTradableReason,

  /** Specifies the Order Type. */
  OpenOrderType: OrderType,

  /** Indicates if the order Amount is specified as lots/shares/contracts or as a monetary purchase amount in instrument currency. */
  OrderAmountType: OrderAmountType,

  /** Relation to other active orders. */
  OrderRelation: OpenOrderRelation,

  /** The UTC date and time the order was placed */
  OrderTime: string({ format: 'date-iso8601' }),

  /** Price at which the order is triggered. */
  Price: number(),

  /** Id of the related position. */
  RelatedPositionId: string(),

  /** Current status of the order */
  Status: OrderStatus,

  /** Secondary price level for StopLimit orders. */
  StopLimitPrice: number(),

  /** Whether the position should be created to open/increase or close/decrease a position. */
  ToOpenClose: ToOpenClose,

  /** Distance to market for a trailing stop order. */
  TrailingStopDistanceToMarket: number(),

  /** Step size for trailing stop order. */
  TrailingStopStep: number(),

  /** Type of price chosen to trigger a conditional order. */
  TriggerPriceType: OrderTriggerPriceType,

  /** Unique Id of the instrument */
  Uic: integer(),

  /** The value date (only for FxForwards). */
  ValueDate: string({ format: 'date-iso8601' }),
})
