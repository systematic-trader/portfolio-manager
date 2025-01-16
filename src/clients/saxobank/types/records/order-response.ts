import {
  boolean,
  type GuardType,
  integer,
  literal,
  number,
  optional,
  props,
  string,
  tuple,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType } from '../derives/asset-type.ts'
import { BuySell } from '../derives/buy-sell.ts'
import { CalculationReliability } from '../derives/calculation-reliability.ts'
import { DurationType } from '../derives/duration-type.ts'
import { MarketState } from '../derives/market-state.ts'
import { NonTradableReason } from '../derives/non-tradable-reason.ts'
import { OpenOrderRelation } from '../derives/open-order-relation.ts'
import { OrderAmountType } from '../derives/order-amount-type.ts'
import { OrderStatus } from '../derives/order-status.ts'
import { OrderType } from '../derives/order-type.ts'
import { PriceType } from '../derives/price-type.ts'
import { ShortTrading } from '../derives/short-trading.ts'
import { TradingStatus } from '../derives/trading-status.ts'
import { InstrumentDisplayAndFormat } from './instrument-display-and-format.ts'
import { InstrumentExchangeDetails } from './instrument-exchange-details.ts'
import { OrderDuration } from './order-duration.ts'

const RelatedOrder = union([
  props({
    OrderId: string(),
    Amount: number(),
    Duration: props({ DurationType }),
    Status: OrderStatus,
    OpenOrderType: OrderType.extract(['Market']),
  }),

  props({
    OrderId: string(),
    Amount: number(),
    Duration: props({ DurationType }),
    Status: OrderStatus,
    OpenOrderType: OrderType.extract(['Stop', 'StopIfTraded', 'Limit']),
    OrderPrice: number(),
  }),

  props({
    OrderId: string(),
    Amount: number(),
    Duration: props({ DurationType }),
    Status: OrderStatus,
    OpenOrderType: OrderType.extract(['StopLimit']),
    OrderPrice: number(),
    StopLimitPrice: number(),
  }),

  props({
    OrderId: string(),
    Amount: number(),
    Duration: props({ DurationType }),
    Status: OrderStatus,
    OpenOrderType: OrderType.extract(['TrailingStop', 'TrailingStopIfTraded']),
    OrderPrice: number(),
    TrailingStopDistanceToMarket: number(),
    TrailingStopStep: number(),
  }),
])

const RelatedOpenOrders = union([
  optional(literal(undefined)),
  tuple([RelatedOrder]),
  tuple([RelatedOrder, RelatedOrder]),
])

// #region Bond
const OrderResponseBondBase = props({
  AssetType: literal('Bond'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: optional(number()),
  CurrentPriceDelayMinutes: optional(integer()),
  CurrentPriceType: optional(PriceType),
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: optional(number()),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,

  MarketValue: optional(number()),
  Ask: optional(number()),
  Bid: optional(number()),
  CurrentPriceLastTraded: optional(string({ format: 'date-iso8601' })),
  ExpiryDate: string({ format: 'date-iso8601' }),
})

export const OrderResponseBondMarket = OrderResponseBondBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseBondMarket extends GuardType<typeof OrderResponseBondMarket> {}

export const OrderResponseBondLimit = OrderResponseBondBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
  DistanceToMarket: optional(number()),
}))

export interface OrderResponseBondLimit extends GuardType<typeof OrderResponseBondLimit> {}

export const OrderResponseBond = union([
  OrderResponseBondMarket,
  OrderResponseBondLimit,
])

export type OrderResponseBond = GuardType<typeof OrderResponseBond>
// #endregion

// #region CfdOnEtc
const OrderResponseCfdOnEtcBase = props({
  AssetType: literal('CfdOnEtc'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,

  ShortTrading: ShortTrading,
})

export const OrderResponseCfdOnEtcMarket = OrderResponseCfdOnEtcBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseCfdOnEtcMarket extends GuardType<typeof OrderResponseCfdOnEtcMarket> {}

export const OrderResponseCfdOnEtcLimit = OrderResponseCfdOnEtcBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseCfdOnEtcLimit extends GuardType<typeof OrderResponseCfdOnEtcLimit> {}

export const OrderResponseCfdOnEtcStopIfTraded = OrderResponseCfdOnEtcBase.merge(props({
  OpenOrderType: OrderType.extract(['StopIfTraded']),
  Price: number(),
}))

export interface OrderResponseCfdOnEtcStopIfTraded extends GuardType<typeof OrderResponseCfdOnEtcStopIfTraded> {}

export const OrderResponseCfdOnEtcTrailingStopIfTraded = OrderResponseCfdOnEtcBase.merge(props({
  OpenOrderType: OrderType.extract(['TrailingStopIfTraded']),
  Price: number(),
  TrailingStopStep: number(),
  TrailingStopDistanceToMarket: number(),
}))

export interface OrderResponseCfdOnEtcTrailingStopIfTraded
  extends GuardType<typeof OrderResponseCfdOnEtcTrailingStopIfTraded> {}

export const OrderResponseCfdOnEtcStopLimit = OrderResponseCfdOnEtcBase.merge(props({
  OpenOrderType: OrderType.extract(['StopLimit']),
  Price: number(),
  StopLimitPrice: number(),
}))

export interface OrderResponseCfdOnEtcStopLimit extends GuardType<typeof OrderResponseCfdOnEtcStopLimit> {}

export const OrderResponseCfdOnEtc = union([
  OrderResponseCfdOnEtcMarket,
  OrderResponseCfdOnEtcLimit,
  OrderResponseCfdOnEtcStopIfTraded,
  OrderResponseCfdOnEtcTrailingStopIfTraded,
  OrderResponseCfdOnEtcStopLimit,
])

export type OrderResponseCfdOnEtc = GuardType<typeof OrderResponseCfdOnEtc>
// #endregion

// #region CfdOnEtf
const OrderResponseCfdOnEtfBase = props({
  AssetType: literal('CfdOnEtf'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,

  ShortTrading: ShortTrading,
})

export const OrderResponseCfdOnEtfMarket = OrderResponseCfdOnEtfBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseCfdOnEtfMarket extends GuardType<typeof OrderResponseCfdOnEtfMarket> {}

export const OrderResponseCfdOnEtfLimit = OrderResponseCfdOnEtfBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseCfdOnEtfLimit extends GuardType<typeof OrderResponseCfdOnEtfLimit> {}

export const OrderResponseCfdOnEtfStopIfTraded = OrderResponseCfdOnEtfBase.merge(props({
  OpenOrderType: OrderType.extract(['StopIfTraded']),
  Price: number(),
}))

export interface OrderResponseCfdOnEtfStopIfTraded extends GuardType<typeof OrderResponseCfdOnEtfStopIfTraded> {}

export const OrderResponseCfdOnEtfTrailingStopIfTraded = OrderResponseCfdOnEtfBase.merge(props({
  OpenOrderType: OrderType.extract(['TrailingStopIfTraded']),
  Price: number(),
  TrailingStopStep: number(),
  TrailingStopDistanceToMarket: number(),
}))

export interface OrderResponseCfdOnEtfTrailingStopIfTraded
  extends GuardType<typeof OrderResponseCfdOnEtfTrailingStopIfTraded> {}

export const OrderResponseCfdOnEtfStopLimit = OrderResponseCfdOnEtfBase.merge(props({
  OpenOrderType: OrderType.extract(['StopLimit']),
  Price: number(),
  StopLimitPrice: number(),
}))

export interface OrderResponseCfdOnEtfStopLimit extends GuardType<typeof OrderResponseCfdOnEtfStopLimit> {}

export const OrderResponseCfdOnEtf = union([
  OrderResponseCfdOnEtfMarket,
  OrderResponseCfdOnEtfLimit,
  OrderResponseCfdOnEtfStopIfTraded,
  OrderResponseCfdOnEtfTrailingStopIfTraded,
  OrderResponseCfdOnEtfStopLimit,
])

export type OrderResponseCfdOnEtf = GuardType<typeof OrderResponseCfdOnEtf>
// #endregion

// #region CfdOnEtn
const OrderResponseCfdOnEtnBase = props({
  AssetType: literal('CfdOnEtn'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,

  ShortTrading: ShortTrading,
})

export const OrderResponseCfdOnEtnMarket = OrderResponseCfdOnEtnBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseCfdOnEtnMarket extends GuardType<typeof OrderResponseCfdOnEtnMarket> {}

export const OrderResponseCfdOnEtnLimit = OrderResponseCfdOnEtnBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseCfdOnEtnLimit extends GuardType<typeof OrderResponseCfdOnEtnLimit> {}

export const OrderResponseCfdOnEtnStopIfTraded = OrderResponseCfdOnEtnBase.merge(props({
  OpenOrderType: OrderType.extract(['StopIfTraded']),
  Price: number(),
}))

export interface OrderResponseCfdOnEtnStopIfTraded extends GuardType<typeof OrderResponseCfdOnEtnStopIfTraded> {}

export const OrderResponseCfdOnEtnTrailingStopIfTraded = OrderResponseCfdOnEtnBase.merge(props({
  OpenOrderType: OrderType.extract(['TrailingStopIfTraded']),
  Price: number(),
  TrailingStopStep: number(),
  TrailingStopDistanceToMarket: number(),
}))

export interface OrderResponseCfdOnEtnTrailingStopIfTraded
  extends GuardType<typeof OrderResponseCfdOnEtnTrailingStopIfTraded> {}

export const OrderResponseCfdOnEtnStopLimit = OrderResponseCfdOnEtnBase.merge(props({
  OpenOrderType: OrderType.extract(['StopLimit']),
  Price: number(),
  StopLimitPrice: number(),
}))

export interface OrderResponseCfdOnEtnStopLimit extends GuardType<typeof OrderResponseCfdOnEtnStopLimit> {}

export const OrderResponseCfdOnEtn = union([
  OrderResponseCfdOnEtnMarket,
  OrderResponseCfdOnEtnLimit,
  OrderResponseCfdOnEtnStopIfTraded,
  OrderResponseCfdOnEtnTrailingStopIfTraded,
  OrderResponseCfdOnEtnStopLimit,
])

export type OrderResponseCfdOnEtn = GuardType<typeof OrderResponseCfdOnEtn>
// #endregion

// #region CfdOnFund
const OrderResponseCfdOnFundBase = props({
  AssetType: literal('CfdOnFund'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,

  ShortTrading: ShortTrading,
})

export const OrderResponseCfdOnFundMarket = OrderResponseCfdOnFundBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseCfdOnFundMarket extends GuardType<typeof OrderResponseCfdOnFundMarket> {}

export const OrderResponseCfdOnFundLimit = OrderResponseCfdOnFundBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseCfdOnFundLimit extends GuardType<typeof OrderResponseCfdOnFundLimit> {}

export const OrderResponseCfdOnFundStopIfTraded = OrderResponseCfdOnFundBase.merge(props({
  OpenOrderType: OrderType.extract(['StopIfTraded']),
  Price: number(),
}))

export interface OrderResponseCfdOnFundStopIfTraded extends GuardType<typeof OrderResponseCfdOnFundStopIfTraded> {}

export const OrderResponseCfdOnFundTrailingStopIfTraded = OrderResponseCfdOnFundBase.merge(props({
  OpenOrderType: OrderType.extract(['TrailingStopIfTraded']),
  Price: number(),
  TrailingStopStep: number(),
  TrailingStopDistanceToMarket: number(),
}))

export interface OrderResponseCfdOnFundTrailingStopIfTraded
  extends GuardType<typeof OrderResponseCfdOnFundTrailingStopIfTraded> {}

export const OrderResponseCfdOnFundStopLimit = OrderResponseCfdOnFundBase.merge(props({
  OpenOrderType: OrderType.extract(['StopLimit']),
  Price: number(),
  StopLimitPrice: number(),
}))

export interface OrderResponseCfdOnFundStopLimit extends GuardType<typeof OrderResponseCfdOnFundStopLimit> {}

export const OrderResponseCfdOnFund = union([
  OrderResponseCfdOnFundMarket,
  OrderResponseCfdOnFundLimit,
  OrderResponseCfdOnFundStopIfTraded,
  OrderResponseCfdOnFundTrailingStopIfTraded,
  OrderResponseCfdOnFundStopLimit,
])

export type OrderResponseCfdOnFund = GuardType<typeof OrderResponseCfdOnFund>
// #endregion

// #region CfdOnFutures
const OrderResponseCfdOnFuturesBase = props({
  AssetType: literal('CfdOnFutures'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,

  ExpiryDate: string({ format: 'date-iso8601' }),
})

export const OrderResponseCfdOnFuturesMarket = OrderResponseCfdOnFuturesBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseCfdOnFuturesMarket extends GuardType<typeof OrderResponseCfdOnFuturesMarket> {}

export const OrderResponseCfdOnFuturesLimit = OrderResponseCfdOnFuturesBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseCfdOnFuturesLimit extends GuardType<typeof OrderResponseCfdOnFuturesLimit> {}

export const OrderResponseCfdOnFuturesStopIfTraded = OrderResponseCfdOnFuturesBase.merge(props({
  OpenOrderType: OrderType.extract(['StopIfTraded']),
  Price: number(),
}))

export interface OrderResponseCfdOnFuturesStopIfTraded
  extends GuardType<typeof OrderResponseCfdOnFuturesStopIfTraded> {}

export const OrderResponseCfdOnFuturesTrailingStopIfTraded = OrderResponseCfdOnFuturesBase.merge(props({
  OpenOrderType: OrderType.extract(['TrailingStopIfTraded']),
  Price: number(),
  TrailingStopStep: number(),
  TrailingStopDistanceToMarket: number(),
}))

export interface OrderResponseCfdOnFuturesTrailingStopIfTraded
  extends GuardType<typeof OrderResponseCfdOnFuturesTrailingStopIfTraded> {}

export const OrderResponseCfdOnFuturesStopLimit = OrderResponseCfdOnFuturesBase.merge(props({
  OpenOrderType: OrderType.extract(['StopLimit']),
  Price: number(),
  StopLimitPrice: number(),
}))

export interface OrderResponseCfdOnFuturesStopLimit extends GuardType<typeof OrderResponseCfdOnFuturesStopLimit> {}

export const OrderResponseCfdOnFutures = union([
  OrderResponseCfdOnFuturesMarket,
  OrderResponseCfdOnFuturesLimit,
  OrderResponseCfdOnFuturesStopIfTraded,
  OrderResponseCfdOnFuturesTrailingStopIfTraded,
  OrderResponseCfdOnFuturesStopLimit,
])

export type OrderResponseCfdOnFutures = GuardType<typeof OrderResponseCfdOnFutures>
// #endregion

// #region CfdOnIndex
const OrderResponseCfdOnIndexBase = props({
  AssetType: literal('CfdOnIndex'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,
})

export const OrderResponseCfdOnIndexMarket = OrderResponseCfdOnIndexBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseCfdOnIndexMarket extends GuardType<typeof OrderResponseCfdOnIndexMarket> {}

export const OrderResponseCfdOnIndexLimit = OrderResponseCfdOnIndexBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseCfdOnIndexLimit extends GuardType<typeof OrderResponseCfdOnIndexLimit> {}

export const OrderResponseCfdOnIndexStopIfTraded = OrderResponseCfdOnIndexBase.merge(props({
  OpenOrderType: OrderType.extract(['StopIfTraded']),
  Price: number(),
}))

export interface OrderResponseCfdOnIndexStopIfTraded extends GuardType<typeof OrderResponseCfdOnIndexStopIfTraded> {}

export const OrderResponseCfdOnIndexTrailingStopIfTraded = OrderResponseCfdOnIndexBase.merge(props({
  OpenOrderType: OrderType.extract(['TrailingStopIfTraded']),
  Price: number(),
  TrailingStopStep: number(),
  TrailingStopDistanceToMarket: number(),
}))

export interface OrderResponseCfdOnIndexTrailingStopIfTraded
  extends GuardType<typeof OrderResponseCfdOnIndexTrailingStopIfTraded> {}

export const OrderResponseCfdOnIndexStopLimit = OrderResponseCfdOnIndexBase.merge(props({
  OpenOrderType: OrderType.extract(['StopLimit']),
  Price: number(),
  StopLimitPrice: number(),
}))

export interface OrderResponseCfdOnIndexStopLimit extends GuardType<typeof OrderResponseCfdOnIndexStopLimit> {}

export const OrderResponseCfdOnIndex = union([
  OrderResponseCfdOnIndexMarket,
  OrderResponseCfdOnIndexLimit,
  OrderResponseCfdOnIndexStopIfTraded,
  OrderResponseCfdOnIndexTrailingStopIfTraded,
  OrderResponseCfdOnIndexStopLimit,
])

export type OrderResponseCfdOnIndex = GuardType<typeof OrderResponseCfdOnIndex>
// #endregion

// #region CfdOnStock
const OrderResponseCfdOnStockBase = props({
  AssetType: literal('CfdOnStock'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,

  ShortTrading: ShortTrading,
})

export const OrderResponseCfdOnStockMarket = OrderResponseCfdOnStockBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseCfdOnStockMarket extends GuardType<typeof OrderResponseCfdOnStockMarket> {}

export const OrderResponseCfdOnStockLimit = OrderResponseCfdOnStockBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseCfdOnStockLimit extends GuardType<typeof OrderResponseCfdOnStockLimit> {}

export const OrderResponseCfdOnStockStopIfTraded = OrderResponseCfdOnStockBase.merge(props({
  OpenOrderType: OrderType.extract(['StopIfTraded']),
  Price: number(),
}))

export interface OrderResponseCfdOnStockStopIfTraded extends GuardType<typeof OrderResponseCfdOnStockStopIfTraded> {}

export const OrderResponseCfdOnStockTrailingStopIfTraded = OrderResponseCfdOnStockBase.merge(props({
  OpenOrderType: OrderType.extract(['TrailingStopIfTraded']),
  Price: number(),
  TrailingStopStep: number(),
  TrailingStopDistanceToMarket: number(),
}))

export interface OrderResponseCfdOnStockTrailingStopIfTraded
  extends GuardType<typeof OrderResponseCfdOnStockTrailingStopIfTraded> {}

export const OrderResponseCfdOnStockStopLimit = OrderResponseCfdOnStockBase.merge(props({
  OpenOrderType: OrderType.extract(['StopLimit']),
  Price: number(),
  StopLimitPrice: number(),
}))

export interface OrderResponseCfdOnStockStopLimit extends GuardType<typeof OrderResponseCfdOnStockStopLimit> {}

export const OrderResponseCfdOnStock = union([
  OrderResponseCfdOnStockMarket,
  OrderResponseCfdOnStockLimit,
  OrderResponseCfdOnStockStopIfTraded,
  OrderResponseCfdOnStockTrailingStopIfTraded,
  OrderResponseCfdOnStockStopLimit,
])

export type OrderResponseCfdOnStock = GuardType<typeof OrderResponseCfdOnStock>
// #endregion

// #region ContractFutures
const OrderResponseContractFuturesBase = props({
  AssetType: literal('ContractFutures'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,

  ExpiryDate: string({ format: 'date-iso8601' }),
  OpenInterest: number(),
})

export const OrderResponseContractFuturesMarket = OrderResponseContractFuturesBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseContractFuturesMarket extends GuardType<typeof OrderResponseContractFuturesMarket> {}

export const OrderResponseContractFuturesLimit = OrderResponseContractFuturesBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseContractFuturesLimit extends GuardType<typeof OrderResponseContractFuturesLimit> {}

export const OrderResponseContractFuturesStopIfTraded = OrderResponseContractFuturesBase.merge(props({
  OpenOrderType: OrderType.extract(['StopIfTraded']),
  Price: number(),
}))

export interface OrderResponseContractFuturesStopIfTraded
  extends GuardType<typeof OrderResponseContractFuturesStopIfTraded> {}

export const OrderResponseContractFuturesTrailingStopIfTraded = OrderResponseContractFuturesBase.merge(props({
  OpenOrderType: OrderType.extract(['TrailingStopIfTraded']),
  Price: number(),
  TrailingStopStep: number(),
  TrailingStopDistanceToMarket: number(),
}))

export interface OrderResponseContractFuturesTrailingStopIfTraded
  extends GuardType<typeof OrderResponseContractFuturesTrailingStopIfTraded> {}

export const OrderResponseContractFuturesStopLimit = OrderResponseContractFuturesBase.merge(props({
  OpenOrderType: OrderType.extract(['StopLimit']),
  Price: number(),
  StopLimitPrice: number(),
}))

export interface OrderResponseContractFuturesStopLimit
  extends GuardType<typeof OrderResponseContractFuturesStopLimit> {}

export const OrderResponseContractFutures = union([
  OrderResponseContractFuturesMarket,
  OrderResponseContractFuturesLimit,
  OrderResponseContractFuturesStopIfTraded,
  OrderResponseContractFuturesTrailingStopIfTraded,
  OrderResponseContractFuturesStopLimit,
])

export type OrderResponseContractFutures = GuardType<typeof OrderResponseContractFutures>
// #endregion

// #region Etc
const OrderResponseEtcBase = props({
  AssetType: literal('Etc'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,
})

export const OrderResponseEtcMarket = OrderResponseEtcBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseEtcMarket extends GuardType<typeof OrderResponseEtcMarket> {}

export const OrderResponseEtcLimit = OrderResponseEtcBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseEtcLimit extends GuardType<typeof OrderResponseEtcLimit> {}

export const OrderResponseEtcStopIfTraded = OrderResponseEtcBase.merge(props({
  OpenOrderType: OrderType.extract(['StopIfTraded']),
  Price: number(),
}))

export interface OrderResponseEtcStopIfTraded extends GuardType<typeof OrderResponseEtcStopIfTraded> {}

export const OrderResponseEtcTrailingStopIfTraded = OrderResponseEtcBase.merge(props({
  OpenOrderType: OrderType.extract(['TrailingStopIfTraded']),
  Price: number(),
  TrailingStopStep: number(),
  TrailingStopDistanceToMarket: number(),
}))

export interface OrderResponseEtcTrailingStopIfTraded extends GuardType<typeof OrderResponseEtcTrailingStopIfTraded> {}

export const OrderResponseEtcStopLimit = OrderResponseEtcBase.merge(props({
  OpenOrderType: OrderType.extract(['StopLimit']),
  Price: number(),
  StopLimitPrice: number(),
}))

export interface OrderResponseEtcStopLimit extends GuardType<typeof OrderResponseEtcStopLimit> {}

export const OrderResponseEtc = union([
  OrderResponseEtcMarket,
  OrderResponseEtcLimit,
  OrderResponseEtcStopIfTraded,
  OrderResponseEtcTrailingStopIfTraded,
  OrderResponseEtcStopLimit,
])

export type OrderResponseEtc = GuardType<typeof OrderResponseEtc>
// #endregion

// #region Etf
const OrderResponseEtfBase = props({
  AssetType: literal('Etf'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,
})

export const OrderResponseEtfMarket = OrderResponseEtfBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseEtfMarket extends GuardType<typeof OrderResponseEtfMarket> {}

export const OrderResponseEtfLimit = OrderResponseEtfBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseEtfLimit extends GuardType<typeof OrderResponseEtfLimit> {}

export const OrderResponseEtfStopIfTraded = OrderResponseEtfBase.merge(props({
  OpenOrderType: OrderType.extract(['StopIfTraded']),
  Price: number(),
}))

export interface OrderResponseEtfStopIfTraded extends GuardType<typeof OrderResponseEtfStopIfTraded> {}

export const OrderResponseEtfTrailingStopIfTraded = OrderResponseEtfBase.merge(props({
  OpenOrderType: OrderType.extract(['TrailingStopIfTraded']),
  Price: number(),
  TrailingStopStep: number(),
  TrailingStopDistanceToMarket: number(),
}))

export interface OrderResponseEtfTrailingStopIfTraded extends GuardType<typeof OrderResponseEtfTrailingStopIfTraded> {}

export const OrderResponseEtfStopLimit = OrderResponseEtfBase.merge(props({
  OpenOrderType: OrderType.extract(['StopLimit']),
  Price: number(),
  StopLimitPrice: number(),
}))

export interface OrderResponseEtfStopLimit extends GuardType<typeof OrderResponseEtfStopLimit> {}

export const OrderResponseEtf = union([
  OrderResponseEtfMarket,
  OrderResponseEtfLimit,
  OrderResponseEtfStopIfTraded,
  OrderResponseEtfTrailingStopIfTraded,
  OrderResponseEtfStopLimit,
])

export type OrderResponseEtf = GuardType<typeof OrderResponseEtf>
// #endregion

// #region Etn
const OrderResponseEtnBase = props({
  AssetType: literal('Etn'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,
})

export const OrderResponseEtnMarket = OrderResponseEtnBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseEtnMarket extends GuardType<typeof OrderResponseEtnMarket> {}

export const OrderResponseEtnLimit = OrderResponseEtnBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseEtnLimit extends GuardType<typeof OrderResponseEtnLimit> {}

export const OrderResponseEtnStopIfTraded = OrderResponseEtnBase.merge(props({
  OpenOrderType: OrderType.extract(['StopIfTraded']),
  Price: number(),
}))

export interface OrderResponseEtnStopIfTraded extends GuardType<typeof OrderResponseEtnStopIfTraded> {}

export const OrderResponseEtnTrailingStopIfTraded = OrderResponseEtnBase.merge(props({
  OpenOrderType: OrderType.extract(['TrailingStopIfTraded']),
  Price: number(),
  TrailingStopStep: number(),
  TrailingStopDistanceToMarket: number(),
}))

export interface OrderResponseEtnTrailingStopIfTraded extends GuardType<typeof OrderResponseEtnTrailingStopIfTraded> {}

export const OrderResponseEtnStopLimit = OrderResponseEtnBase.merge(props({
  OpenOrderType: OrderType.extract(['StopLimit']),
  Price: number(),
  StopLimitPrice: number(),
}))

export interface OrderResponseEtnStopLimit extends GuardType<typeof OrderResponseEtnStopLimit> {}

export const OrderResponseEtn = union([
  OrderResponseEtnMarket,
  OrderResponseEtnLimit,
  OrderResponseEtnStopIfTraded,
  OrderResponseEtnTrailingStopIfTraded,
  OrderResponseEtnStopLimit,
])

export type OrderResponseEtn = GuardType<typeof OrderResponseEtn>
// #endregion

// #region Fund
const OrderResponseFundBase = props({
  AssetType: literal('Fund'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,
})

export const OrderResponseFundMarket = OrderResponseFundBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseFundMarket extends GuardType<typeof OrderResponseFundMarket> {}

export const OrderResponseFundLimit = OrderResponseFundBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseFundLimit extends GuardType<typeof OrderResponseFundLimit> {}

export const OrderResponseFundStopIfTraded = OrderResponseFundBase.merge(props({
  OpenOrderType: OrderType.extract(['StopIfTraded']),
  Price: number(),
}))

export interface OrderResponseFundStopIfTraded extends GuardType<typeof OrderResponseFundStopIfTraded> {}

export const OrderResponseFundTrailingStopIfTraded = OrderResponseFundBase.merge(props({
  OpenOrderType: OrderType.extract(['TrailingStopIfTraded']),
  Price: number(),
  TrailingStopStep: number(),
  TrailingStopDistanceToMarket: number(),
}))

export interface OrderResponseFundTrailingStopIfTraded
  extends GuardType<typeof OrderResponseFundTrailingStopIfTraded> {}

export const OrderResponseFundStopLimit = OrderResponseFundBase.merge(props({
  OpenOrderType: OrderType.extract(['StopLimit']),
  Price: number(),
  StopLimitPrice: number(),
}))

export interface OrderResponseFundStopLimit extends GuardType<typeof OrderResponseFundStopLimit> {}

export const OrderResponseFund = union([
  OrderResponseFundMarket,
  OrderResponseFundLimit,
  OrderResponseFundStopIfTraded,
  OrderResponseFundTrailingStopIfTraded,
  OrderResponseFundStopLimit,
])

export type OrderResponseFund = GuardType<typeof OrderResponseFund>
// #endregion

// #region FxForwards
const OrderResponseFxForwardsBase = props({
  AssetType: literal('FxForwards'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,
})

export const OrderResponseFxForwardsMarket = OrderResponseFxForwardsBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseFxForwardsMarket extends GuardType<typeof OrderResponseFxForwardsMarket> {}

export const OrderResponseFxForwardsLimit = OrderResponseFxForwardsBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseFxForwardsLimit extends GuardType<typeof OrderResponseFxForwardsLimit> {}

export const OrderResponseFxForwards = union([
  OrderResponseFxForwardsMarket,
  OrderResponseFxForwardsLimit,
])

export type OrderResponseFxForwards = GuardType<typeof OrderResponseFxForwards>
// #endregion

// #region FxSpot
const OrderResponseFxSpotBase = props({
  AssetType: literal('FxSpot'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,

  Ask: number(),
  Bid: number(),
  DistanceToMarket: optional(number()),
  MarketValue: number(),
})

export const OrderResponseFxSpotMarket = OrderResponseFxSpotBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseFxSpotMarket extends GuardType<typeof OrderResponseFxSpotMarket> {}

export const OrderResponseFxSpotLimit = OrderResponseFxSpotBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseFxSpotLimit extends GuardType<typeof OrderResponseFxSpotLimit> {}

export const OrderResponseFxSpotStopIfTraded = OrderResponseFxSpotBase.merge(props({
  OpenOrderType: OrderType.extract(['StopIfTraded']),
  Price: number(),
}))

export interface OrderResponseFxSpotStopIfTraded extends GuardType<typeof OrderResponseFxSpotStopIfTraded> {}

export const OrderResponseFxSpotTrailingStopIfTraded = OrderResponseFxSpotBase.merge(props({
  OpenOrderType: OrderType.extract(['TrailingStopIfTraded']),
  Price: number(),
  TrailingStopStep: number(),
  TrailingStopDistanceToMarket: number(),
}))

export interface OrderResponseFxSpotTrailingStopIfTraded
  extends GuardType<typeof OrderResponseFxSpotTrailingStopIfTraded> {}

export const OrderResponseFxSpotStopLimit = OrderResponseFxSpotBase.merge(props({
  OpenOrderType: OrderType.extract(['StopLimit']),
  Price: number(),
  StopLimitPrice: number(),
}))

export interface OrderResponseFxSpotStopLimit extends GuardType<typeof OrderResponseFxSpotStopLimit> {}

export const OrderResponseFxSpot = union([
  OrderResponseFxSpotMarket,
  OrderResponseFxSpotLimit,
  OrderResponseFxSpotStopIfTraded,
  OrderResponseFxSpotTrailingStopIfTraded,
  OrderResponseFxSpotStopLimit,
])

export type OrderResponseFxSpot = GuardType<typeof OrderResponseFxSpot>
// #endregion

// #region Stock
const OrderResponseStockBase = props({
  AssetType: literal('Stock'),
  Uic: integer(),
  RelatedOpenOrders,

  AccountId: string(),
  AccountKey: string(),
  Amount: integer({ exclusiveMinimum: 0 }),
  BuySell: BuySell,
  CalculationReliability: CalculationReliability,
  ClientId: string(),
  ClientKey: string(),
  ClientName: string(),
  CorrelationKey: string(),
  CurrentPrice: number(),
  CurrentPriceDelayMinutes: integer(),
  CurrentPriceType: PriceType,
  DisplayAndFormat: InstrumentDisplayAndFormat,
  Duration: OrderDuration,
  Exchange: InstrumentExchangeDetails,
  ExternalReference: optional(string()),
  IpoSubscriptionFee: number(),
  IsExtendedHoursEnabled: boolean(),
  IsForceOpen: boolean(),
  IsMarketOpen: boolean(),
  MarketPrice: number(),
  MarketState: MarketState,
  NonTradableReason: NonTradableReason,
  OpenOrderType: OrderType,
  OrderAmountType: OrderAmountType,
  OrderId: string(),
  OrderRelation: OpenOrderRelation,
  OrderTime: string({ format: 'date-iso8601' }),
  Status: OrderStatus,
  TradingStatus: TradingStatus,
})

export const OrderResponseStockMarket = OrderResponseStockBase.merge(props({
  OpenOrderType: OrderType.extract(['Market']),
}))

export interface OrderResponseStockMarket extends GuardType<typeof OrderResponseStockMarket> {}

export const OrderResponseStockLimit = OrderResponseStockBase.merge(props({
  OpenOrderType: OrderType.extract(['Limit']),
  Price: number(),
}))

export interface OrderResponseStockLimit extends GuardType<typeof OrderResponseStockLimit> {}

export const OrderResponseStockStopIfTraded = OrderResponseStockBase.merge(props({
  OpenOrderType: OrderType.extract(['StopIfTraded']),
  Price: number(),
}))

export interface OrderResponseStockStopIfTraded extends GuardType<typeof OrderResponseStockStopIfTraded> {}

export const OrderResponseStockTrailingStopIfTraded = OrderResponseStockBase.merge(props({
  OpenOrderType: OrderType.extract(['TrailingStopIfTraded']),
  Price: number(),
  TrailingStopStep: number(),
  TrailingStopDistanceToMarket: number(),
}))

export interface OrderResponseStockTrailingStopIfTraded
  extends GuardType<typeof OrderResponseStockTrailingStopIfTraded> {}

export const OrderResponseStockStopLimit = OrderResponseStockBase.merge(props({
  OpenOrderType: OrderType.extract(['StopLimit']),
  Price: number(),
  StopLimitPrice: number(),
}))

export interface OrderResponseStockStopLimit extends GuardType<typeof OrderResponseStockStopLimit> {}

export const OrderResponseStock = union([
  OrderResponseStockMarket,
  OrderResponseStockLimit,
  OrderResponseStockStopIfTraded,
  OrderResponseStockTrailingStopIfTraded,
  OrderResponseStockStopLimit,
])

export type OrderResponseStock = GuardType<typeof OrderResponseStock>
// #endregion

// #region Unknown
export const OrderResponseUnknown = props({
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
  AccountId: string(),
  AccountKey: string(),
  ExternalReference: optional(string()),
  OrderId: string(),
  Status: OrderStatus,
  Uic: integer(),
}, {
  extendable: true,
})

export interface OrderResponseUnknown extends GuardType<typeof OrderResponseUnknown> {}
// #endregion

export const OrderResponseUnion = union([
  OrderResponseBond,
  OrderResponseCfdOnEtc,
  OrderResponseCfdOnEtf,
  OrderResponseCfdOnEtn,
  OrderResponseCfdOnFund,
  OrderResponseCfdOnFutures,
  OrderResponseCfdOnIndex,
  OrderResponseCfdOnStock,
  OrderResponseContractFutures,
  OrderResponseEtc,
  OrderResponseEtf,
  OrderResponseEtn,
  OrderResponseFund,
  OrderResponseFxForwards,
  OrderResponseFxSpot,
  OrderResponseStock,
  OrderResponseUnknown,
])

export type OrderResponseUnion =
  | OrderResponseBond
  | OrderResponseCfdOnEtc
  | OrderResponseCfdOnEtf
  | OrderResponseCfdOnEtn
  | OrderResponseCfdOnFund
  | OrderResponseCfdOnFutures
  | OrderResponseCfdOnIndex
  | OrderResponseCfdOnStock
  | OrderResponseContractFutures
  | OrderResponseEtc
  | OrderResponseEtf
  | OrderResponseEtn
  | OrderResponseFund
  | OrderResponseFxForwards
  | OrderResponseFxSpot
  | OrderResponseStock
  | OrderResponseUnknown
