import {
  array,
  boolean,
  enums,
  type GuardType,
  number,
  optional,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetClass } from '../derived/asset-class.ts'
import { Currency3 } from '../derived/currency.ts'
import { OrderCPPStatus } from '../derived/order-cpp-status.ts'
import { OrderStatus } from '../derived/order-status.ts'

// These are different values than used elsewhere in the API
const OrderType = enums([
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

// #region Common
const OrderCommon = props({
  orderId: number(),
  order_ref: string(), // the cOID from the order placement request
})
// #endregion

// #region Stock
const OrderStockBase = OrderCommon.merge({
  secType: AssetClass.extract(['STK']),
  account: string(),
  acct: string(),
  cashCcy: Currency3,
  companyName: string(),
  conid: number(),
  conidex: string(),
  description1: string(),
  filledQuantity: number(),
  isEventTrading: string(),
  lastExecutionTime_r: number(),
  lastExecutionTime: string(),
  listingExchange: string(),
  order_ccp_status: OrderCPPStatus,
  orderDesc: string(),
  origOrderType: string(), // Similar to orderType, but with different casing
  outsideRTH: optional(boolean()),
  remainingQuantity: number(),
  side: enums(['BUY', 'SELL']),
  sizeAndFills: string(),
  status: OrderStatus,
  supportsTaxOpt: string(),
  ticker: string(),
  timeInForce: enums(['CLOSE']), // todo add more
  totalSize: number(),

  // Useless properties
  fgColor: string(),
  bgColor: string(),
})

// #region Limit
export const OrderStockLimit = OrderStockBase.merge({
  orderType: OrderType.extract(['Limit']),
  price: string({ format: 'number' }),
})

export interface OrderStockLimit extends GuardType<typeof OrderStockLimit> {}
// #endregion

// #region LimitOnClose
export const OrderStockLimitOnClose = OrderStockBase.merge({
  orderType: OrderType.extract(['LIMITONCLOSE']),
  price: string({ format: 'number' }),
})

export interface OrderStockLimitOnClose extends GuardType<typeof OrderStockLimitOnClose> {}
// #endregion

// #region Market
export const OrderStockMarket = OrderStockBase.merge({
  orderType: OrderType.extract(['Market']),
})

export interface OrderStockMarket extends GuardType<typeof OrderStockMarket> {}
// #endregion

// #region MarketOnClose
export const OrderStockMarketOnClose = OrderStockBase.merge({
  orderType: OrderType.extract(['MARKETONCLOSE']),
})

export interface OrderStockMarketOnClose extends GuardType<typeof OrderStockMarketOnClose> {}
// #endregion

// #region Midprice
export const OrderStockMidPrice = OrderStockBase.merge({
  orderType: OrderType.extract(['MidPrice']),
  price: string({ format: 'number' }),
})

export interface OrderStockMidPrice extends GuardType<typeof OrderStockMidPrice> {}
// #endregion

// #region Stop
export const OrderStockStop = OrderStockBase.merge({
  orderType: OrderType.extract(['Stop']),

  // these two values seems to be the same ("stop price")
  auxPrice: string({ format: 'number' }),
  stop_price: string({ format: 'number' }),
})

export interface OrderStockStop extends GuardType<typeof OrderStockStop> {}
// #endregion

// #region StopLimit
export const OrderStockStopLimit = OrderStockBase.merge({
  orderType: OrderType.extract(['Stop Limit']),

  // limit price
  price: string({ format: 'number' }),

  // stop price (both are the same)
  auxPrice: string({ format: 'number' }),
  stop_price: string({ format: 'number' }),
})

export interface OrderStockStopLimit extends GuardType<typeof OrderStockStopLimit> {}
// #endregion

// #region TrailingStop
export const OrderStockTrailingStop = OrderStockBase.merge({
  orderType: OrderType.extract(['TRAILING_STOP']),

  stop_price: string({ format: 'number' }),
  auxPrice: string(), // e.g. "5" or "5%" (depends on the trailing type specified when placing the order)
})

export interface OrderStockTrailingStop extends GuardType<typeof OrderStockTrailingStop> {}
// #endregion

// #region TrailingStop
export const OrderStockTrailingStopLimit = OrderStockBase.merge({
  orderType: OrderType.extract(['TRAILING_STOP_LIMIT']),

  price: string({ format: 'number' }), // limit price
  stop_price: string({ format: 'number' }), // stop price
  auxPrice: string(), // e.g. "5" or "5%" (depends on the trailing type specified when placing the order)
})

export interface OrderStockTrailingStopLimit extends GuardType<typeof OrderStockTrailingStopLimit> {}
// #endregion

export const OrderStock = union([
  OrderStockLimit,
  OrderStockLimitOnClose,
  OrderStockMarket,
  OrderStockMarketOnClose,
  OrderStockMidPrice,
  OrderStockStop,
  OrderStockStopLimit,
  OrderStockTrailingStop,
  OrderStockTrailingStopLimit,
])

export type OrderStock = GuardType<typeof OrderStock>

// #endregion

// #region Unknown
export const OrderUnknown = OrderCommon.merge(props({
  status: OrderStatus,
}))
// #endregion

export const OrdersResponse = props({
  orders: optional(array(
    union([
      OrderStock,
      OrderUnknown,
    ]),
  )),
  snapshot: boolean(),
})

export type OrdersResponse = GuardType<typeof OrdersResponse>
