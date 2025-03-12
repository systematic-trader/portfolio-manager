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
const OrderType = {
  Limit: literal('Limit'),
  LimitOnClose: literal('LIMITONCLOSE'),
  Market: literal('Market'),
  MarketOnClose: literal('MARKETONCLOSE'),
  MidPrice: literal('MidPrice'),
  Stop: literal('Stop'),
  StopLimit: literal('Stop Limit'),
  TrailingStop: literal('TRAILING_STOP'),
  TrailingStopLimit: literal('TRAILING_STOP_LIMIT'),
}

const Common = props({
  account: string(),
  acct: string(),
  avgPrice: optional(string({ format: 'number' })),
  bgColor: string(), // Useless property
  cashCcy: Currency3,
  companyName: string(),
  conid: number(),
  conidex: string(),
  description1: string(),
  fgColor: string(),
  filledQuantity: number(),
  isEventTrading: string(),
  lastExecutionTime_r: number(),
  lastExecutionTime: string(),
  listingExchange: ExchangeCode,
  order_ccp_status: OrderCCPStatus,
  order_ref: string(), // the cOID from the order placement request
  orderDesc: string(),
  orderId: number(),
  origOrderType: string(), // use "orderType" instead
  remainingQuantity: number(),
  side: OrderSide,
  sizeAndFills: string(),
  status: OrderStatus,
  supportsTaxOpt: string(),
  ticker: string(),
  timeInForce: enums(['CLOSE']),
  totalSize: number(),
})

const OrderCash = Common.merge({
  exchange: ExchangeCode, // might be legacy and use "listingExchange" instead
  secType: AssetClass.extract(['CASH']),
  totalCashSize: number(),
})

const OrderFuture = Common.merge({
  exchange: ExchangeCode, // might be legacy and use "listingExchange" instead
  secType: AssetClass.extract(['FUT']),
})

const OrderStock = Common.merge({
  outsideRTH: optional(boolean()),
  secType: AssetClass.extract(['STK']),
})

const Type = {
  NotImplemented: Common.pick(['orderId', 'order_ref']).merge({
    status: OrderStatus,
    orderType: string(),
  }, { extendable: true }),
  Cash: {
    Market: OrderCash.merge({
      orderType: literal('Market'),
    }),
  },
  Future: {
    Limit: OrderFuture.merge({
      orderType: OrderType.Limit,
      price: string({ format: 'number' }),
    }),
    LimitOnClose: OrderFuture.merge({
      orderType: OrderType.LimitOnClose,
      price: string({ format: 'number' }),
    }),
    Market: OrderFuture.merge({
      orderType: OrderType.Market,
    }),
    MarketOnClose: OrderFuture.merge({
      orderType: OrderType.MarketOnClose,
    }),
    MidPrice: OrderFuture.merge({
      orderType: OrderType.MidPrice,
      price: string({ format: 'number' }),
    }),
    Stop: OrderFuture.merge({
      orderType: OrderType.Stop,
      // these two values seems to be the same ("stop price")
      auxPrice: string({ format: 'number' }),
      stop_price: string({ format: 'number' }),
    }),
    StopLimit: OrderFuture.merge({
      orderType: OrderType.StopLimit,
      price: string({ format: 'number' }), // limit price
      // stop price (both are the same)
      auxPrice: string({ format: 'number' }),
      stop_price: string({ format: 'number' }),
    }),
    TrailingStop: OrderFuture.merge({
      orderType: OrderType.TrailingStop,

      auxPrice: string(), // e.g. "5" or "5%" (depends on the trailing type specified when placing the order)
      stop_price: string({ format: 'number' }),
    }),
    TrailingStopLimit: OrderFuture.merge({
      orderType: OrderType.TrailingStopLimit,

      price: string({ format: 'number' }), // limit price
      auxPrice: string(), // e.g. "5" or "5%" (depends on the trailing type specified when placing the order)
      stop_price: string({ format: 'number' }), // stop price
    }),
  },
  Stock: {
    Limit: OrderStock.merge({
      orderType: OrderType.Limit,
      price: string({ format: 'number' }),
    }),
    LimitOnClose: OrderStock.merge({
      orderType: OrderType.LimitOnClose,
      price: string({ format: 'number' }),
    }),
    Market: OrderStock.merge({
      orderType: OrderType.Market,
    }),
    MarketOnClose: OrderStock.merge({
      orderType: OrderType.MarketOnClose,
    }),
    MidPrice: OrderStock.merge({
      orderType: OrderType.MidPrice,
      price: string({ format: 'number' }),
    }),
    Stop: OrderStock.merge({
      orderType: OrderType.Stop,
      // these two values seems to be the same ("stop price")
      auxPrice: string({ format: 'number' }),
      stop_price: string({ format: 'number' }),
    }),
    StopLimit: OrderStock.merge({
      orderType: OrderType.StopLimit,
      price: string({ format: 'number' }), // limit price
      // stop price (both are the same)
      auxPrice: string({ format: 'number' }),
      stop_price: string({ format: 'number' }),
    }),
    TrailingStop: OrderStock.merge({
      orderType: OrderType.TrailingStop,

      auxPrice: string(), // e.g. "5" or "5%" (depends on the trailing type specified when placing the order)
      stop_price: string({ format: 'number' }),
    }),
    TrailingStopLimit: OrderStock.merge({
      orderType: OrderType.TrailingStopLimit,

      price: string({ format: 'number' }), // limit price
      auxPrice: string(), // e.g. "5" or "5%" (depends on the trailing type specified when placing the order)
      stop_price: string({ format: 'number' }), // stop price
    }),
  },
}

// #endregion

export const OrderTypes = [
  Type.Cash.Market, // Cash (currency conversion)

  Type.Stock.Limit,
  Type.Stock.LimitOnClose,
  Type.Stock.Market,
  Type.Stock.MarketOnClose,
  Type.Stock.MidPrice,
  Type.Stock.Stop,
  Type.Stock.StopLimit,
  Type.Stock.TrailingStop,
  Type.Stock.TrailingStopLimit,

  Type.Future.Limit,
  Type.Future.LimitOnClose,
  Type.Future.Market,
  Type.Future.MarketOnClose,
  Type.Future.MidPrice,
  Type.Future.Stop,
  Type.Future.StopLimit,
  Type.Future.TrailingStop,
  Type.Future.TrailingStopLimit,

  // Remaining
  Type.NotImplemented,
]

export const Order = union(OrderTypes)

export type Order = GuardType<typeof Order>

export const Orders = props({
  orders: optional(array(Order)),
  snapshot: boolean(),
})

export type Orders = GuardType<typeof Orders>
