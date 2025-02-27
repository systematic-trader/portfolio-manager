import {
  array,
  boolean,
  enums,
  type GuardType,
  literal,
  props,
  string,
  union,
  unknown,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { OrderStatus } from '../../../../saxobank/types/derives/order-status.ts'
import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import type { ExchangeCode } from '../../../types/derived/exchange-code.ts'

const ResponseOrderPlacedElement = props({
  order_id: string(),
  order_status: enums(['PreSubmitted', 'Submitted']),
  encrypt_message: literal('1'),
})

const ResponseConfirmationRequiredElement = props({
  id: string(),
  message: array(string()),
  isSuppressed: boolean(),
  messageIds: array(string()),
})

const ResponseError = props({
  error: string(),
}, { extendable: true })

// #region Get Orders
const GetOrdersResponse = props({
  orders: array(unknown()), // we probably don't need the get API for orders, so i'll leave it unknown for now just so i can see what's going on
  snapshot: literal(true),
})

type GetOrdersResponse = GuardType<typeof GetOrdersResponse>
// #endregion

// #region Post orders
interface StaticParameters {
  readonly acctId: string
  readonly conidex: `${string}@${ExchangeCode}`
  readonly manualIndicator: boolean
  // readonly secType: `${string}:STK` // todo add more types (futures)
  readonly cOID: string // todo not really required, but we want to specify it so we know it's part of the response
  // readonly parentId?: undefined | string // todo only required for bracket orders
  // readonly isSingleGroup?: undefined | boolean // todo what does this do?
  readonly outsideRth?: undefined | boolean
  readonly side: 'BUY' | 'SELL'
  readonly tif: 'GTC' | 'OPG' | 'DAY' | 'IOC' | 'PAX' // todo "PAX" is for crypto only - we probably have other fields we need to specify for time in force
  readonly quantity: number
  // readonly allOrNone?: undefined | boolean // todo when do we need to specify this?
}

// #region Parameters by order type
interface ParametersByOrderTypeLimit {
  readonly orderType: 'LMT'
  readonly price: number
}

interface ParametersByOrderTypeMarket {
  readonly orderType: 'MKT'
}

interface ParametersByOrderTypeStop {
  readonly orderType: 'STP'
  readonly price: number
}

interface ParametersByOrderTypeStopLimit {
  readonly orderType: 'STOP_LIMIT'
  readonly price: number
  readonly auxPrice: number
}

interface ParametersByOrderTypeMidprice {
  readonly orderType: 'MIDPRICE'
  readonly price: number
}

interface ParametersByOrderTypeTrailingStop {
  readonly orderType: 'TRAIL'
  readonly price: number
  readonly auxPrice: number
  readonly trailingAmt: number
  readonly trailingType: 'amt' | '%'
}

interface ParametersByOrderTypeTrailingStopLimit {
  readonly orderType: 'TRAILLMT'
  readonly price: number
  readonly auxPrice: number
  readonly trailingAmt: number
  readonly trailingType: 'amt' | '%'
}

type ParametersByOrderType =
  | ParametersByOrderTypeLimit
  | ParametersByOrderTypeMarket
  | ParametersByOrderTypeStop
  | ParametersByOrderTypeStopLimit
  | ParametersByOrderTypeMidprice
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

// #region Method 1: Currency conversion order
type ParametersCurrencyConversion = {
  readonly accountId: string
  readonly orders: readonly [
    Omit<StaticParameters, 'quantity'> & ParametersByOrderTypeMarket & ParametersByTimeInForce & {
      readonly isCcyConv: true
      readonly fxQty: number
      readonly side: 'BUY'
    },
  ]
}

const ResponseCurrencyConversion = union([
  ResponseOrderPlacedElement,
  ResponseConfirmationRequiredElement,
  ResponseError,
])

type ResponseCurrencyConversion = GuardType<typeof ResponseCurrencyConversion>
// #endregion

// #region Method 2: Single order (without any related orders)
type ParametersSingle = {
  readonly accountId: string
  readonly orders: readonly [StaticParameters & ParametersByOrderType & ParametersByTimeInForce]
}

const ResponseSingle = union([
  ResponseOrderPlacedElement,
  ResponseConfirmationRequiredElement,
  ResponseError,
])

type ResponseSingle = GuardType<typeof ResponseSingle>
// #endregion

// #endregion

export class Orders {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  async get(parameters: {
    /** Filter results using a comma-separated list of Order Status values */
    readonly filters?: undefined | OrderStatus | readonly OrderStatus[]

    /**
     * Instructs IB to clear cache of orders and obtain updated view from brokerage backend
     * Response will be an empty array
     */
    // todo fix return type
    readonly force?: undefined | boolean

    /** Retrieve orders for a specific account in the structure */
    readonly accountId?: undefined | string
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  }): Promise<GetOrdersResponse> {
    return await this.#client.get({
      path: 'orders',
      searchParams: parameters,
      guard: GetOrdersResponse, // todo write guard
      signal,
      timeout,
    })
  }

  /**
   * Method 1:
   * Currency conversion order
   */
  async post(
    parameters: ParametersCurrencyConversion,
    options?: { readonly timeout?: undefined | number },
  ): Promise<ResponseCurrencyConversion>

  /**
   * Method 2:
   * Single order (without any related orders)
   */
  async post(
    parameters: ParametersSingle,
    options?: { readonly timeout?: undefined | number },
  ): Promise<ResponseSingle>

  /**
   * Submit a new order(s) ticket, bracket, or OCA group.
   */
  async post({ accountId, orders }: ParametersCurrencyConversion | ParametersSingle, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    // Method 1
    if (orders.length === 1 && 'isCcyConv' in orders[0] && orders[0].isCcyConv === true) {
      return await this.#client.post({
        path: `${accountId}/orders`,
        body: orders as never,
        guard: ResponseSingle,
        signal,
        timeout,
      })
    }

    // Method 2
    if (orders.length === 1) {
      return await this.#client.post({
        path: `${accountId}/orders`,
        body: orders as never,
        guard: ResponseSingle,
        signal,
        timeout,
      })
    }

    throw new Error('Unknown order method')
  }
}
