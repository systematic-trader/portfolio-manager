import {
  array,
  boolean,
  type GuardType,
  literal,
  never,
  number,
  optional,
  props,
  string,
  tuple,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import type {
  OrderParametersByOrderType,
  OrderParametersByTimeInForce,
  OrderParametersStatic,
} from '../../../types/derived/order-parameters.ts'
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

const GetForceOrdersResponse = props({
  orders: optional(never()), // empty array gets converted to undefined
  snapshot: boolean(),
})

type GetForceOrdersResponse = GuardType<typeof GetForceOrdersResponse>
// #endregion

// #region Post Orders
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

export const OrderPlacementOCAResponseSuccessElement = props({
  encrypt_message: optional(literal('1')),
  local_order_id: string(), // will correspond to the cOID
  oca_group_id: string(),
  order_id: string(),
  order_status: OrderStatus,
  text: optional(string()),

  // Example:
  // > Order held while securities are located.
  warning_message: optional(string()),
})

export interface OrderPlacementResponseSuccessElement extends GuardType<typeof OrderPlacementResponseSuccessElement> {}

export const OrderPlacementResponseError = props({
  error: string(),
}, { extendable: true })

export interface OrderPlacementResponseError extends GuardType<typeof OrderPlacementResponseError> {}

type OrderParametersSingle = OrderParametersStatic & OrderParametersByOrderType & OrderParametersByTimeInForce & {
  readonly isSingleGroup?: undefined | false
}

type OrderParametersRoot = (OrderParametersStatic & OrderParametersByOrderType & OrderParametersByTimeInForce) & {
  readonly isSingleGroup: true
}

type OrderParametersAttached = (OrderParametersStatic & OrderParametersByOrderType & OrderParametersByTimeInForce) & {
  readonly isSingleGroup: true
}

// #region Method 1: Currency conversion order
export type OrderPlacementParametersCurrencyConversion = {
  readonly accountId: string
  readonly parentOrderId?: undefined
  readonly orders: readonly [
    Omit<OrderParametersSingle, 'quantity'> & {
      readonly orderType: 'MKT'
      readonly isCcyConv: true
      readonly fxQty: number // 'fxQty' must be specified instead of 'quantity'
    },
  ]
}

export const PlaceOrderResponseCurrencyConversion = union([
  tuple([OrderPlacementResponseSuccessElement]),
  OrderPlacementResponseError,
])

export type PlaceOrderResponseCurrencyConversion = GuardType<typeof PlaceOrderResponseCurrencyConversion>
// #endregion

// #region Method 2: Single order (without any related orders)
export type OrderPlacementParametersSingle = {
  readonly accountId: string
  readonly parentOrderId?: undefined
  readonly orders: readonly [OrderParametersSingle]
}

// #endregion

// #region Method 3: Single root order with a single attached order
export type OrderPlacementParametersRootWithOneAttached = {
  readonly accountId: string
  readonly parentOrderId?: undefined
  readonly orders: readonly [OrderParametersRoot, OrderParametersAttached]
}

// #endregion

// #region Method 4: Single root order with two attached orders
export type OrderPlacementParametersRootWithTwoAttached = {
  readonly accountId: string
  readonly parentOrderId?: undefined
  readonly orders: readonly [OrderParametersRoot, OrderParametersAttached, OrderParametersAttached]
}

// #endregion

// #region Method 5: Attach one order to an existing parent order
export type OrderPlacementParametersExistingRootSingle = {
  readonly accountId: string
  readonly parentOrderId: string
  readonly orders: readonly [OrderParametersAttached]
}
// #endregion

// #region Method 6: Attach orders to an existing parent order
export type OrderPlacementParametersExistingRootDouble = {
  readonly accountId: string
  readonly parentOrderId: string
  readonly orders: readonly [OrderParametersAttached, OrderParametersAttached]
}
// #endregion

export const PlaceOrderSingleResponse = union([
  tuple([OrderPlacementResponseSuccessElement]),
  OrderPlacementResponseError,
])

export type PlaceOrderSingleResponse = GuardType<typeof PlaceOrderSingleResponse>

export const PlaceOrderOCAResponse = union([
  tuple([OrderPlacementResponseSuccessElement, OrderPlacementResponseSuccessElement]),
  OrderPlacementResponseError,
])

export type PlaceOrderOCAResponse = GuardType<typeof PlaceOrderOCAResponse>

// #endregion

export class Orders {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  /**
   * Retrieves open orders and filled or cancelled orders submitted during the current brokerage session.
   */
  async get({ force, ...parameters }: {
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
    // If force was specified, we will make the request once without returning it
    // This will give IB some time to do what they need to do
    // After this request, we immediately make another request without force to return the orders
    if (force === true) {
      await this.#client.get({
        path: 'orders',
        searchParams: { ...parameters, force },
        guard: GetForceOrdersResponse, // when using 'force', the response will be an empty array
        signal,
        timeout,
      })
    }

    return await this.#client.get({
      path: 'orders',
      searchParams: parameters,
      guard: GetOrdersResponse,
      signal,
      timeout,
    })
  }

  /**
   * Method 1:
   * Currency conversion order
   */
  async post(
    parameters: OrderPlacementParametersCurrencyConversion,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderResponseCurrencyConversion>

  /**
   * Method 2:
   * Single order (without any related orders)
   */
  async post(
    parameters: OrderPlacementParametersSingle,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderSingleResponse>

  /**
   * Method 3:
   * Single root order with a single attached order
   */
  async post(
    parameters: OrderPlacementParametersRootWithOneAttached,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderSingleResponse>

  /**
   * Method 4:
   * Single root order with two attached orders
   */
  async post(
    parameters: OrderPlacementParametersRootWithTwoAttached,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderSingleResponse>

  /**
   * Method 5:
   * Attach one order to an existing parent order
   */
  async post(
    parameters: OrderPlacementParametersExistingRootSingle,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderOCAResponse>

  /**
   * Method 6:
   * Attach two orders to an existing parent order
   */
  async post(
    parameters: OrderPlacementParametersExistingRootDouble,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderOCAResponse>

  /**
   * Submit a new order(s) ticket, bracket, or OCA group.
   */
  async post(
    { accountId, orders, parentOrderId }:
      | OrderPlacementParametersCurrencyConversion
      | OrderPlacementParametersSingle
      | OrderPlacementParametersRootWithOneAttached
      | OrderPlacementParametersRootWithTwoAttached
      | OrderPlacementParametersExistingRootSingle
      | OrderPlacementParametersExistingRootDouble,
    { signal, timeout }: {
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
    } = {},
  ): Promise<PlaceOrderResponseCurrencyConversion | PlaceOrderSingleResponse | PlaceOrderOCAResponse> {
    // Method 1
    if (
      parentOrderId === undefined && orders.length === 1 && 'isCcyConv' in orders[0] && orders[0].isCcyConv === true
    ) {
      return await this.#client.post({
        path: `${accountId}/orders`,
        body: { orders } as never,
        guard: PlaceOrderSingleResponse,
        signal,
        timeout,
      })
    }

    // Method 2
    if (parentOrderId === undefined && orders.length === 1) {
      return await this.#client.post({
        path: `${accountId}/orders`,
        body: { orders } as never,
        guard: PlaceOrderSingleResponse,
        signal,
        timeout,
      })
    }

    // Method 3
    if (parentOrderId === undefined && orders.length === 2) {
      const [rootOrder, attachedOrder] = orders

      return await this.#client.post({
        path: `${accountId}/orders`,
        body: {
          orders: [
            rootOrder,
            {
              ...attachedOrder,
              parentId: rootOrder.cOID,
            },
          ],
        } as never,
        guard: PlaceOrderSingleResponse,
        signal,
        timeout,
      })
    }

    // Method 4
    if (parentOrderId === undefined && orders.length === 3) {
      const [rootOrder, attachedOrderLeft, attachedOrderRight] = orders

      return await this.#client.post({
        path: `${accountId}/orders`,
        body: {
          orders: [
            rootOrder,
            {
              ...attachedOrderLeft,
              parentId: rootOrder.cOID,
            },
            {
              ...attachedOrderRight,
              parentId: rootOrder.cOID,
            },
          ],
        } as never,
        guard: PlaceOrderSingleResponse,
        signal,
        timeout,
      })
    }

    // Method 5
    if (parentOrderId !== undefined && orders.length === 1) {
      return await this.#client.post({
        path: `${accountId}/orders`,
        body: {
          orders: orders.map((order) => ({
            ...order,
            parentId: parentOrderId,
          })),
        } as never,
        guard: PlaceOrderSingleResponse,
        signal,
        timeout,
      })
    }

    // Method 6
    if (parentOrderId !== undefined && orders.length === 2) {
      return await this.#client.post({
        path: `${accountId}/orders`,
        body: {
          orders: orders.map((order) => ({
            ...order,
            parentId: parentOrderId,
          })),
        } as never,
        guard: PlaceOrderOCAResponse,
        signal,
        timeout,
      })
    }

    throw new Error('Unknown order method')
  }
}
