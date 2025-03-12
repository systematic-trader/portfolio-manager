import {
  type GuardType,
  literal,
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
import { Orders as OrdersResponse } from '../../../types/record/orders.ts'

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
  readonly parentOrderId?: undefined
  readonly orders: readonly [
    Omit<OrderParametersSingle, 'quantity'> & {
      readonly orderType: 'MKT'
      readonly isCcyConv: true
      readonly fxQty: number // 'fxQty' must be specified instead of 'quantity'
    },
  ]
}

export const PlaceOrderResponseCurrencyConversion = tuple([OrderPlacementResponseSuccessElement])

export type PlaceOrderResponseCurrencyConversion = GuardType<typeof PlaceOrderResponseCurrencyConversion>
// #endregion

// #region Method 2: Single order (without any related orders)
export type OrderPlacementParametersSingle = {
  readonly parentOrderId?: undefined
  readonly orders: readonly [OrderParametersSingle]
}

// #endregion

// #region Method 3: Single root order with a single attached order
export type OrderPlacementParametersRootWithOneAttached = {
  readonly parentOrderId?: undefined
  readonly orders: readonly [OrderParametersRoot, OrderParametersAttached]
}

// #endregion

// #region Method 4: Single root order with two attached orders
export type OrderPlacementParametersRootWithTwoAttached = {
  readonly parentOrderId?: undefined
  readonly orders: readonly [OrderParametersRoot, OrderParametersAttached, OrderParametersAttached]
}

// #endregion

// #region Method 5: Attach one order to an existing parent order
export type OrderPlacementParametersExistingRootSingle = {
  readonly parentOrderId: string
  readonly orders: readonly [OrderParametersAttached]
}
// #endregion

// #region Method 6: Attach orders to an existing parent order
export type OrderPlacementParametersExistingRootDouble = {
  readonly parentOrderId: string
  readonly orders: readonly [OrderParametersAttached, OrderParametersAttached]
}
// #endregion

export const PlaceOrderSingleResponse = tuple([OrderPlacementResponseSuccessElement])

export type PlaceOrderSingleResponse = GuardType<typeof PlaceOrderSingleResponse>

export const PlaceOrderOCAResponse = tuple([OrderPlacementResponseSuccessElement, OrderPlacementResponseSuccessElement])

export type PlaceOrderOCAResponse = GuardType<typeof PlaceOrderOCAResponse>

// #endregion

const OrderPlacementResponseError = props({
  error: string(),
}, { extendable: true })

interface OrderPlacementResponseError extends GuardType<typeof OrderPlacementResponseError> {}

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
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<OrdersResponse> {
    const accountId = this.#client.accountID

    // If force was specified, we will make the request once without returning it
    // This will give IB some time to do what they need to do
    // After this request, we immediately make another request without force to return the orders
    if (force === true) {
      await this.#client.get({
        path: 'orders',
        searchParams: { ...parameters, force, accountId },
        guard: OrdersResponse, // when using 'force', the response will be an empty array
        signal,
        timeout,
      })
    }

    return await this.#client.get({
      path: 'orders',
      searchParams: { ...parameters, accountId },
      guard: OrdersResponse,
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
  async post({ orders, parentOrderId }:
    | OrderPlacementParametersCurrencyConversion
    | OrderPlacementParametersSingle
    | OrderPlacementParametersRootWithOneAttached
    | OrderPlacementParametersRootWithTwoAttached
    | OrderPlacementParametersExistingRootSingle
    | OrderPlacementParametersExistingRootDouble, { signal, timeout }: {
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
    } = {}): Promise<PlaceOrderResponseCurrencyConversion | PlaceOrderSingleResponse | PlaceOrderOCAResponse> {
    let response:
      | undefined
      | OrderPlacementResponseError
      | PlaceOrderResponseCurrencyConversion
      | PlaceOrderSingleResponse
      | PlaceOrderOCAResponse = undefined

    // Method 1
    if (
      parentOrderId === undefined && orders.length === 1 && 'isCcyConv' in orders[0] && orders[0].isCcyConv === true
    ) {
      const [rootOrder] = orders

      response = await this.#client.post({
        path: `${this.#client.accountID}/orders`,
        body: {
          orders: [{
            ...rootOrder,
            acctId: this.#client.accountID,
          }],
        },
        guard: union([PlaceOrderSingleResponse, OrderPlacementResponseError]),
        signal,
        timeout,
      })
    } // Method 2
    else if (parentOrderId === undefined && orders.length === 1) {
      const [rootOrder] = orders

      response = await this.#client.post({
        path: `${this.#client.accountID}/orders`,
        body: {
          orders: [{
            ...rootOrder,
            acctId: this.#client.accountID,
          }],
        },
        guard: union([PlaceOrderSingleResponse, OrderPlacementResponseError]),
        signal,
        timeout,
      })
    } // Method 3
    else if (parentOrderId === undefined && orders.length === 2) {
      const [rootOrder, attachedOrder] = orders

      response = await this.#client.post({
        path: `${this.#client.accountID}/orders`,
        body: {
          orders: [
            {
              ...rootOrder,
              acctId: this.#client.accountID,
            },
            {
              ...attachedOrder,
              parentId: rootOrder.cOID,
              acctId: this.#client.accountID,
            },
          ],
        } as never,
        guard: union([PlaceOrderSingleResponse, OrderPlacementResponseError]),
        signal,
        timeout,
      })
    } // Method 4
    else if (parentOrderId === undefined && orders.length === 3) {
      const [rootOrder, attachedOrderLeft, attachedOrderRight] = orders

      response = await this.#client.post({
        path: `${this.#client.accountID}/orders`,
        body: {
          orders: [
            {
              ...rootOrder,
              acctId: this.#client.accountID,
            },
            {
              ...attachedOrderLeft,
              parentId: rootOrder.cOID,
              acctId: this.#client.accountID,
            },
            {
              ...attachedOrderRight,
              parentId: rootOrder.cOID,
              acctId: this.#client.accountID,
            },
          ],
        } as never,
        guard: union([PlaceOrderSingleResponse, OrderPlacementResponseError]),
        signal,
        timeout,
      })
    } // Method 5
    else if (parentOrderId !== undefined && orders.length === 1) {
      const [attachedOrder] = orders

      response = await this.#client.post({
        path: `${this.#client.accountID}/orders`,
        body: {
          orders: [{
            ...attachedOrder,
            parentId: parentOrderId,
            acctId: this.#client.accountID,
          }],
        } as never,
        guard: union([PlaceOrderSingleResponse, OrderPlacementResponseError]),
        signal,
        timeout,
      })
    } // Method 6
    else if (parentOrderId !== undefined && orders.length === 2) {
      const [attachedOrderLeft, attachedOrderRight] = orders

      response = await this.#client.post({
        path: `${this.#client.accountID}/orders`,
        body: {
          orders: [{
            ...attachedOrderLeft,
            parentId: parentOrderId,
            acctId: this.#client.accountID,
          }, {
            ...attachedOrderRight,
            parentId: parentOrderId,
            acctId: this.#client.accountID,
          }],
        } as never,
        guard: union([PlaceOrderOCAResponse, OrderPlacementResponseError]),
        signal,
        timeout,
      })
    }

    if (response === undefined) {
      throw new Error('Unknown order method')
    }

    if ('error' in response) {
      throw new Error(`Unable to place order (message=${response.error})`)
    }

    return response
  }
}
