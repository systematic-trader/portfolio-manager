import {
  array,
  boolean,
  enums,
  type GuardType,
  literal,
  number,
  optional,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetClass } from '../derived/asset-class.ts'
import { Currency3 } from '../derived/currency.ts'
import { ExchangeCode } from '../derived/exchange-code.ts'
import { OrderCCPStatus } from '../derived/order-ccp-status.ts'
import { OrderSide } from '../derived/order-side.ts'
import { OrderStatus } from '../derived/order-status.ts'

// These are different values than used elsewhere in the API
const OrderExecutionType = enums([
  'Limit',
  'LIMITONCLOSE',
  'Market',
  'MARKETONCLOSE',
  'MidPrice',
  'Stop',
  'Stop Limit',
  'TRAILING_STOP',
  'TRAILING_STOP_LIMIT',
])

// #region Base
const OrderBase = props({
  orderId: number(),
  order_ref: string(), // the cOID from the order placement request
})
// #endregion

// #region Stock
const OrderStockBase = OrderBase.merge({
  account: string(),
  acct: string(),
  avgPrice: optional(string()),
  bgColor: string(), // Useless property
  cashCcy: Currency3,
  companyName: string(),
  conid: number(),
  conidex: string(),
  description1: string(),
  fgColor: string(), // Useless property
  filledQuantity: number(),
  isEventTrading: string(),
  lastExecutionTime_r: number(),
  lastExecutionTime: string(),
  listingExchange: string(),
  order_ccp_status: OrderCCPStatus,
  orderDesc: string(),
  origOrderType: string(), // Similar to orderType, but with different casing
  outsideRTH: optional(boolean()),
  remainingQuantity: number(),
  secType: AssetClass.extract(['STK']),
  side: OrderSide,
  sizeAndFills: string(),
  status: OrderStatus,
  supportsTaxOpt: string(),
  ticker: string(),
  timeInForce: enums(['CLOSE']), // todo add more
  totalSize: number(),
})

// #region Limit
const OrderStockLimit = OrderStockBase.merge({
  orderType: OrderExecutionType.extract(['Limit']),
  price: string({ format: 'number' }),
})
// #endregion

// #region LimitOnClose
const OrderStockLimitOnClose = OrderStockBase.merge({
  orderType: OrderExecutionType.extract(['LIMITONCLOSE']),
  price: string({ format: 'number' }),
})
// #endregion

// #region Market
const OrderStockMarket = OrderStockBase.merge({
  orderType: OrderExecutionType.extract(['Market']),
})
// #endregion

// #region MarketOnClose
const OrderStockMarketOnClose = OrderStockBase.merge({
  orderType: OrderExecutionType.extract(['MARKETONCLOSE']),
})
// #endregion

// #region Midprice
const OrderStockMidPrice = OrderStockBase.merge({
  orderType: OrderExecutionType.extract(['MidPrice']),
  price: string({ format: 'number' }),
})
// #endregion

// #region Stop
const OrderStockStop = OrderStockBase.merge({
  orderType: OrderExecutionType.extract(['Stop']),

  // these two values seems to be the same ("stop price")
  auxPrice: string({ format: 'number' }),
  stop_price: string({ format: 'number' }),
})
// #endregion

// #region StopLimit
const OrderStockStopLimit = OrderStockBase.merge({
  orderType: OrderExecutionType.extract(['Stop Limit']),

  // limit price
  price: string({ format: 'number' }),

  // stop price (both are the same)
  auxPrice: string({ format: 'number' }),
  stop_price: string({ format: 'number' }),
})
// #endregion

// #region TrailingStop
const OrderStockTrailingStop = OrderStockBase.merge({
  orderType: OrderExecutionType.extract(['TRAILING_STOP']),

  stop_price: string({ format: 'number' }),
  auxPrice: string(), // e.g. "5" or "5%" (depends on the trailing type specified when placing the order)
})
// #endregion

// #region TrailingStop
const OrderStockTrailingStopLimit = OrderStockBase.merge({
  orderType: OrderExecutionType.extract(['TRAILING_STOP_LIMIT']),

  price: string({ format: 'number' }), // limit price
  stop_price: string({ format: 'number' }), // stop price
  auxPrice: string(), // e.g. "5" or "5%" (depends on the trailing type specified when placing the order)
})
// #endregion

// #region Unknown
const OrderTypeNotImplemented = OrderBase.merge(props({
  status: OrderStatus,
  orderType: string(),
}, { extendable: true }))
// #endregion

// #endregion

// #region Cash
const OrderCash = OrderBase.merge({
  account: string(),
  acct: string(),
  avgPrice: optional(string({ format: 'number' })),
  bgColor: string(),
  cashCcy: Currency3,
  companyName: string(),
  conid: number(),
  conidex: string(),
  description1: string(),
  exchange: ExchangeCode,
  fgColor: string(),
  filledQuantity: number(),
  isEventTrading: string(),
  lastExecutionTime: string(),
  lastExecutionTime_r: number(),
  listingExchange: ExchangeCode,
  orderDesc: string(),
  orderType: literal('Market'),
  order_ccp_status: OrderCCPStatus,
  origOrderType: literal('MARKET'),
  remainingQuantity: number(),
  secType: AssetClass.extract(['CASH']),
  side: OrderSide,
  sizeAndFills: string(),
  status: OrderStatus,
  supportsTaxOpt: string(),
  ticker: string(),
  timeInForce: string(), // todo 'CLOSE'
  totalCashSize: number(),
  totalSize: number(),
})
// #endregion

export const OrderTypes = [
  // Stock
  OrderStockLimit,
  OrderStockLimitOnClose,
  OrderStockMarket,
  OrderStockMarketOnClose,
  OrderStockMidPrice,
  OrderStockStop,
  OrderStockStopLimit,
  OrderStockTrailingStop,
  OrderStockTrailingStopLimit,

  // Cash (currency conversion)
  OrderCash,

  // Remaining
  OrderTypeNotImplemented,
]

export const Order = union(OrderTypes)

export type Order = GuardType<typeof Order>

export const Orders = props({
  orders: optional(array(Order)),
  snapshot: boolean(),
})

export type Orders = GuardType<typeof Orders>
