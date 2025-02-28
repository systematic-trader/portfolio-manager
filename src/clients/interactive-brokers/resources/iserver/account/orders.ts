import {
  array,
  boolean,
  type GuardType,
  literal,
  number,
  optional,
  props,
  string,
  tuple,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { debug } from 'node:console'
import { Timeout } from '../../../../../utils/timeout.ts'
import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import type { ExchangeCode } from '../../../types/derived/exchange-code.ts'
import { OrderStatus } from '../../../types/derived/order-status.ts'

// #region Get Orders
// Filtering by other order statuses is will return a http 500 error (internal server error)
type OrderStatusFilter = Extract<
  OrderStatus,
  | 'Cancelled'
  | 'Filled'
  | 'Inactive'
  | 'PreSubmitted'
  | 'Submitted'
>

const GetOrdersResponse = props({
  orders: optional(array(
    props({
      orderId: number(),
      order_ref: string(), // the cOID from the order placement request
      status: OrderStatus,
    }, {
      extendable: true, // we probably don't need the get API for orders, so i'll leave it unknown for now just so i can see what's going on
    }),
  )),
  snapshot: boolean(),
})

type GetOrdersResponse = GuardType<typeof GetOrdersResponse>
// #endregion

// #region Post orders
interface StaticParameters {
  readonly acctId: string
  readonly cOID: string
  readonly conidex: `${string}@${ExchangeCode}`
  readonly manualIndicator: boolean
  readonly outsideRth?: undefined | boolean
  readonly quantity: number
  readonly side: 'BUY' | 'SELL'

  // readonly parentId?: undefined | string // todo only required for bracket orders
  // readonly isSingleGroup?: undefined | boolean // todo what does this do?
  // readonly allOrNone?: undefined | boolean // todo when do we need to specify this?
}

// #region Parameters by order type

/**
 * A Limit order is an order to buy or sell at a specified price or better.
 * The Limit order ensures that if the order fills, it will not fill at a price
 * less favorable than your limit price, but it does not guarantee a fill.
 */
interface ParametersByOrderTypeLimit {
  readonly orderType: 'LMT'
  readonly price: number
}

/**
 * A Limit-on-close (LOC) order will be submitted at the close and will execute
 * if the closing price is at or better than the submitted limit price.
 *
 * All LOC orders must be received at Island by 15:58:00 EST, but may not be
 * canceled or modified after 15:50 EST.
 *
 * Summary of NYSE markets (NYSE, NYSE MKT, NYSE Arca) rules for entering/canceling/modifying
 * limit-on-close (LOC) orders:
 *  - All LOC orders must be received at NYSE markets by 15:50 ET
 *  - Exception: On expiration days, you cannot enter LOC orders after 15:45 ET
 *    to establish or liquidate positions related to a strategy involving
 *    derivative instruments, even if these orders would offset a published imbalance
 *
 * NYSE markets' rules also prohibit the cancellation or reduction in size of any
 * limit-on-close (LOC) order after 15:50 ET.
 */
interface ParametersByOrderTypeLimitOnClose {
  readonly orderType: 'LOC'
  readonly price: number
}

/**
 * A Market order is an order to buy or sell at the market bid or offer price.
 * A market order may increase the likelihood of a fill and the speed of execution,
 * but unlike the Limit order a Market order provides no price protection and may
 * fill at a price far lower/higher than the current displayed bid/ask.
 */
interface ParametersByOrderTypeMarket {
  readonly orderType: 'MKT'
}

/**
 * A Market-on-Close (MOC) order is a market order that is submitted to execute as close to the closing price as possible.
 *
 * Summary of NYSE markets (NYSE, NYSE MKT, NYSE Arca) rules for entering/canceling/modifying market-on-close (MOC):
 * - All MOC orders must be received at NYSE markets by 15:50 ET, unless entered to offset a published imbalance.
 * - NYSE markets' rules also prohibit the cancellation or reduction in size of any market-on-close (MOC) order after 15:50 ET.
 *
 * Summary of Nasdaq rules for entering/canceling/modifying market-on-close (MOC):
 * - All MOC orders must be received at Island by 15:55:00 EST, but may not be canceled or modified after 15:50 EST.
 */
interface ParametersByOrderTypeMarketOnClose {
  readonly orderType: 'MOC'
}

/**
 * The MidPrice order is designed to split the difference between the bid and ask prices,
 * and fill at the current midpoint of the NBBO or better. Set an optional price cap to
 * define the highest price (for a buy order) or the lowest price (for a sell order) you
 * are willing to accept.
 *
 * To achieve the midpoint price or better, the Midprice algo routes the order to the
 * exchange with the highest probability of filling as a Pegged-to-Midpoint order, or in
 * the case of IEX as a Discretionary Peg (D-Peg) order. If no such exchange is available,
 * the MidPrice order is routed as either a native or simulated Relative order.
 */
interface ParametersByOrderTypeMidprice {
  readonly orderType: 'MIDPRICE'
  readonly price: number
}

/**
 * A Stop order is an instruction to submit a buy or sell market order if and when
 * the user-specified stop trigger price is attained or penetrated. A Stop order
 * is not guaranteed a specific execution price and may execute significantly away
 * from its stop price.
 *
 * A Sell Stop order is always placed below the current market price and is typically
 * used to limit a loss or protect a profit on a long stock position.
 *
 * A Buy Stop order is always placed above the current market price. It is typically
 * used to limit a loss or help protect a profit on a short sale.
 */
interface ParametersByOrderTypeStop {
  readonly orderType: 'STP'
  readonly price: number
}

/**
 * A Stop-Limit order is an instruction to submit a buy or sell limit order when the
 * user-specified stop trigger price is attained or penetrated.
 *
 * The order has two basic components: the stop price and the limit price.
 * When a trade has occurred at or through the stop price, the order becomes executable
 * and enters the market as a limit order, which is an order to buy or sell at a
 * specified price or better.
 *
 * A Stop-Limit eliminates the price risk associated with a stop order where the
 * execution price cannot be guaranteed, but exposes the investor to the risk that
 * the order may never fill even if the stop price is reached. The investor could
 * "miss the market" altogether.
 */
interface ParametersByOrderTypeStopLimit {
  readonly orderType: 'STOP_LIMIT'
  readonly price: number
  readonly auxPrice: number
}

/**
 * A sell trailing stop order sets the stop price at a fixed amount below the market
 * price with an attached "trailing" amount. As the market price rises, the stop
 * price rises by the trail amount, but if the stock price falls, the stop loss
 * price doesn't change, and a market order is submitted when the stop price is hit.
 *
 * This technique is designed to allow an investor to specify a limit on the maximum
 * possible loss, without setting a limit on the maximum possible gain.
 *
 * "Buy" trailing stop orders are the mirror image of sell trailing stop orders,
 * and are most appropriate for use in falling markets.
 */
interface ParametersByOrderTypeTrailingStop {
  readonly orderType: 'TRAIL'
  readonly price: number
  readonly trailingAmt: number
  readonly trailingType: 'amt' | '%'
}

/**
 * A trailing stop limit order is designed to allow an investor to specify a limit
 * on the maximum possible loss, without setting a limit on the maximum possible gain.
 * A SELL trailing stop limit moves with the market price, and continually recalculates
 * the stop trigger price at a fixed amount below the market price, based on the
 * user-defined "trailing" amount.
 *
 * The limit order price is also continually recalculated based on the limit offset.
 * As the market price rises, both the stop price and the limit price rise by the
 * trail amount and limit offset respectively, but if the stock price falls, the
 * stop price remains unchanged, and when the stop price is hit a limit order is
 * submitted at the last calculated limit price.
 *
 * A "Buy" trailing stop limit order is the mirror image of a sell trailing stop
 * limit, and is generally used in falling markets.
 */
interface ParametersByOrderTypeTrailingStopLimit {
  readonly orderType: 'TRAILLMT'
  readonly price: number
  readonly auxPrice: number
  readonly trailingAmt: number
  readonly trailingType: 'amt' | '%'
}

/**
 * Read more about the different order types here:
 * @see https://www.interactivebrokers.com/en/trading/ordertypes.php
 * Select "Client portal" as the platform and "Order type" as the order attributes
 */
type ParametersByOrderType =
  | ParametersByOrderTypeLimit
  | ParametersByOrderTypeLimitOnClose
  | ParametersByOrderTypeMarket
  | ParametersByOrderTypeMarketOnClose
  | ParametersByOrderTypeMidprice
  | ParametersByOrderTypeStop
  | ParametersByOrderTypeStopLimit
  | ParametersByOrderTypeTrailingStop
  | ParametersByOrderTypeTrailingStopLimit
// #endregion

// #region Parameters by time in force
interface ParametersByTimeInForceDay {
  readonly tif: 'DAY'
}

interface ParametersByTimeInForceGoodTillCanceled {
  readonly tif: 'GTC'
}

interface ParametersByTimeInForceAtTheOpening {
  readonly tif: 'OPG' // will automatically send a "MOO" (Market On Open) order or "LOO" (Limit On Open) order
}

interface ParametersByTimeInForceOvernight {
  readonly tif: 'OVT'
  // readonly conidex: `${string}@$OVERNIGHT` // todo look more into this
}

interface ParametersByTimeInForceOvernightAndDay {
  readonly tif: 'OND'
}

interface ParametersByTimeInForceGoodTilDate {
  readonly tif: 'GTD'
  // todo how do we add the date?
}

interface ParametersByTimeInForceFillOrKill {
  readonly tif: 'FOK'
}

type ParametersByTimeInForce =
  | ParametersByTimeInForceDay
  | ParametersByTimeInForceGoodTillCanceled
  | ParametersByTimeInForceAtTheOpening
  | ParametersByTimeInForceOvernight
  | ParametersByTimeInForceOvernightAndDay
  | ParametersByTimeInForceGoodTilDate
  | ParametersByTimeInForceFillOrKill
// #endregion

export const OrderPlacementResponseSuccessElement = props({
  encrypt_message: literal('1'),
  local_order_id: string(), // will correspond to the cOID
  order_id: string(),
  order_status: OrderStatus,

  // Seems to be specified when the order has been submitted, but there are some warnings that should be taken into account
  // For instance, when converting currency:
  // > Order Message:
  // > BUY 500 DKK EUR.DKK Forex
  // > Warning: Your order size is below the EUR 20000 IdealPro minimum and will be routed as an odd lot order.
  text: optional(string()),
  warning_message: optional(string()),
})

export interface OrderPlacementResponseSuccessElement extends GuardType<typeof OrderPlacementResponseSuccessElement> {}

export const OrderPlacementResponseConfirmationRequiredElement = props({
  id: string(),
  message: array(string()),
  isSuppressed: boolean(),
  messageIds: array(string()),
})

export interface OrderPlacementResponseConfirmationRequiredElement
  extends GuardType<typeof OrderPlacementResponseConfirmationRequiredElement> {}

export const OrderPlacementResponseError = props({
  error: string(),
}, { extendable: true })

export interface OrderPlacementResponseError extends GuardType<typeof OrderPlacementResponseError> {}

// #region Method 1: Currency conversion order
export type OrderPlacementParametersCurrencyConversion = {
  readonly accountId: string
  readonly orders: readonly [
    Omit<StaticParameters, 'quantity'> & ParametersByOrderTypeMarket & ParametersByTimeInForce & {
      readonly isCcyConv: true
      readonly fxQty: number
    },
  ]
}

export const PlaceOrderResponseCurrencyConversion = union([
  tuple([OrderPlacementResponseSuccessElement]),
  // tuple([ResponseConfirmationRequiredElement]), // todo this might not be needed
  OrderPlacementResponseError,
])

export type ResponseCurrencyConversion = GuardType<typeof PlaceOrderResponseCurrencyConversion>
// #endregion

// #region Method 2: Single order (without any related orders)
export type OrderPlacementParametersSingle = {
  readonly accountId: string
  readonly orders: readonly [StaticParameters & ParametersByOrderType & ParametersByTimeInForce]
}

export const PlaceOrderResponseSingle = union([
  tuple([OrderPlacementResponseSuccessElement]),
  // tuple([ResponseConfirmationRequiredElement]), // todo this might not be needed
  OrderPlacementResponseError,
])

export type PlaceOrderResponseSingle = GuardType<typeof PlaceOrderResponseSingle>
// #endregion

// #endregion

export class Orders {
  readonly #client: InteractiveBrokersResourceClient

  #getOrdersWarm = false

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  /**
   * Retrieves open orders and filled or cancelled orders submitted during the current brokerage session.
   */
  async get(parameters: {
    /** Filter results using a comma-separated list of Order Status values */
    readonly filters?: undefined | OrderStatusFilter | readonly OrderStatusFilter[]

    /**
     * Instructs IB to clear cache of orders and obtain updated view from brokerage backend
     * Response will be an empty array
     */
    readonly force?: undefined | boolean

    /** Retrieve orders for a specific account in the structure */
    readonly accountId?: undefined | string
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
    readonly delay?: undefined | number
  } = {}): Promise<GetOrdersResponse> {
    let force = parameters.force

    while (true) {
      const response = await this.#client.get({
        path: 'orders',
        searchParams: { ...parameters, force },
        guard: GetOrdersResponse,
        signal,
        timeout,
      })

      debug(response)

      // If we get 0 results, and the get orders endpoint is not warmed up, we'll wait a bit and try again
      // If 'force' was set to true, the next request should not have 'force' set (that would end up in an infinite loop)
      const hasOrders = response.orders !== undefined && response.orders.length > 0
      if (hasOrders === false && this.#getOrdersWarm === false) {
        await Timeout.wait(1000)

        this.#getOrdersWarm = true
        force = undefined

        continue
      }

      return response
    }
  }

  /**
   * Method 1:
   * Currency conversion order
   */
  async post(
    parameters: OrderPlacementParametersCurrencyConversion,
    options?: { readonly timeout?: undefined | number },
  ): Promise<ResponseCurrencyConversion>

  /**
   * Method 2:
   * Single order (without any related orders)
   */
  async post(
    parameters: OrderPlacementParametersSingle,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderResponseSingle>

  /**
   * Submit a new order(s) ticket, bracket, or OCA group.
   */
  async post(
    { accountId, orders }: OrderPlacementParametersCurrencyConversion | OrderPlacementParametersSingle,
    { signal, timeout }: {
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
    } = {},
  ): Promise<unknown> {
    // Method 1
    if (orders.length === 1 && 'isCcyConv' in orders[0] && orders[0].isCcyConv === true) {
      return await this.#client.post({
        path: `${accountId}/orders`,
        body: { orders } as never,
        guard: PlaceOrderResponseSingle,
        signal,
        timeout,
      })
    }

    // Method 2
    if (orders.length === 1) {
      return await this.#client.post({
        path: `${accountId}/orders`,
        body: { orders } as never,
        guard: PlaceOrderResponseSingle,
        signal,
        timeout,
      })
    }

    throw new Error('Unknown order method')
  }
}
