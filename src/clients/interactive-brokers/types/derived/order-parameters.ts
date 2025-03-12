import type { ExchangeCode } from './exchange-code.ts'

export interface OrderParametersStatic {
  readonly cOID: string
  readonly conidex: `${string}@${ExchangeCode}`
  readonly manualIndicator: boolean
  readonly outsideRth?: undefined | boolean
  readonly quantity: number
  readonly side: 'BUY' | 'SELL'

  /**
   * It seems that this is an undocumented parameter for order parameters.
   * I've included it since it is used by the Interactive Broker Portal Client (browser client)
   *
   * I am unsure whether this parameter works as intended.
   * IB describes this functionality as you would expect it to work
   * @see https://www.interactivebrokers.com/campus/trading-lessons/all-or-none-aon/
   *
   * However, users report that this functionality does not work as intended
   * @see https://www.reddit.com/r/interactivebrokers/comments/17p8z7c/allornone_orders_being_partially_filled/
   */
  readonly allOrNone?: undefined | boolean
}

// #region Parameters by order type

/**
 * A Limit order is an order to buy or sell at a specified price or better.
 * The Limit order ensures that if the order fills, it will not fill at a price
 * less favorable than your limit price, but it does not guarantee a fill.
 */
interface OrderParametersByTypeLimit {
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
interface OrderParametersByTypeLimitOnClose {
  readonly orderType: 'LOC'
  readonly price: number
}

/**
 * A Market order is an order to buy or sell at the market bid or offer price.
 * A market order may increase the likelihood of a fill and the speed of execution,
 * but unlike the Limit order a Market order provides no price protection and may
 * fill at a price far lower/higher than the current displayed bid/ask.
 */
interface OrderParametersByTypeMarket {
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
interface OrderParametersByTypeMarketOnClose {
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
interface OrderParametersByTypeMidprice {
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
interface OrderParametersByTypeStop {
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
interface OrderParametersByTypeStopLimit {
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
interface OrderParametersByOrderTrailingStop {
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
interface OrderParametersByOrderTrailingStopLimit {
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
export type OrderParametersByOrderType =
  | OrderParametersByTypeLimit
  | OrderParametersByTypeLimitOnClose
  | OrderParametersByTypeMarket
  | OrderParametersByTypeMarketOnClose
  | OrderParametersByTypeMidprice
  | OrderParametersByTypeStop
  | OrderParametersByTypeStopLimit
  | OrderParametersByOrderTrailingStop
  | OrderParametersByOrderTrailingStopLimit
// #endregion

// #region Parameters by time in force
interface OrderParametersByTimeInForceDay {
  readonly tif: 'DAY'
}

interface OrderParametersByTimeInForceGoodTillCanceled {
  readonly tif: 'GTC'
}

interface OrderParametersByTimeInForceAtTheOpening {
  readonly tif: 'OPG' // will automatically send a "MOO" (Market On Open) order or "LOO" (Limit On Open) order
}

interface OrderParametersByTimeInForceOvernight {
  readonly tif: 'OVT'
  // readonly conidex: `${string}@$OVERNIGHT` // todo look more into this
}

interface OrderParametersByTimeInForceOvernightAndDay {
  readonly tif: 'OND'
}

interface OrderParametersByTimeInForceGoodTilDate {
  readonly tif: 'GTD'
  // todo how do we add the date?
}

interface OrderParametersByTimeInForceFillOrKill {
  readonly tif: 'FOK'
}

export type OrderParametersByTimeInForce =
  | OrderParametersByTimeInForceDay
  | OrderParametersByTimeInForceGoodTillCanceled
  | OrderParametersByTimeInForceAtTheOpening
  | OrderParametersByTimeInForceOvernight
  | OrderParametersByTimeInForceOvernightAndDay
  | OrderParametersByTimeInForceGoodTilDate
  | OrderParametersByTimeInForceFillOrKill
// #endregion
