import {
  array,
  type GuardType,
  optional,
  props,
  string,
  tuple,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import type { AssetType } from '../../types/derives/asset-type.ts'
import type { BuySell } from '../../types/derives/buy-sell.ts'
import type { OrderDuration } from '../../types/records/order-duration.ts'
import { Order } from '../../types/records/order.ts'
import { StringErrorResponse } from '../../types/records/string-error-response.ts'

type OrderParametersByOrderType = {
  readonly OrderType: 'Market'
  readonly OrderPrice?: never
  readonly StopLimitPrice?: never
  readonly TrailingStopStep?: never
  readonly TrailingStopDistanceToMarket?: never
} | {
  readonly OrderType: 'Limit' | 'Stop' | 'StopIfTraded'
  readonly OrderPrice: number
  readonly StopLimitPrice?: never
  readonly TrailingStopStep?: never
  readonly TrailingStopDistanceToMarket?: never
} | {
  readonly OrderType: 'StopLimit'
  readonly OrderPrice: number
  readonly StopLimitPrice: number
  readonly TrailingStopStep?: never
  readonly TrailingStopDistanceToMarket?: never
} | {
  readonly OrderType: 'TrailingStop' | 'TrailingStopIfTraded'
  readonly OrderPrice: number
  readonly TrailingStopStep: number
  readonly TrailingStopDistanceToMarket: number
  readonly StopLimitPrice?: never
}

export type SupportedPlacableOrderTypes = OrderParametersByOrderType['OrderType']

type PlaceOrderParametersByAssetType =
  | {
    readonly AssetType: Extract<
      AssetType,
      | 'Bond'
      | 'CfdOnEtc'
      | 'CfdOnEtf'
      | 'CfdOnEtn'
      | 'CfdOnFund'
      | 'CfdOnFutures'
      | 'CfdOnIndex'
      | 'CfdOnStock'
      | 'ContractFutures'
      | 'Etc'
      | 'Etf'
      | 'Etn'
      | 'Fund'
      | 'FxSpot'
      | 'Stock'
    >
    readonly OrderDuration: OrderDuration
  }
  | {
    readonly AssetType: Extract<AssetType, 'FxForwards'>
    readonly ForwardDate: string // iso 8601 date
    readonly OrderDuration: OrderDuration & { readonly DurationType: 'ImmediateOrCancel' }
  }

type PlaceOrderParametersBase =
  & PlaceOrderParametersByAssetType
  & {
    readonly Uic: number
    readonly BuySell: BuySell
    readonly Amount: number
    readonly ManualOrder: boolean
    readonly ExternalReference: string

    readonly AccountKey?: string
    readonly WithAdvice?: boolean
    readonly CancelOrders?: boolean
    readonly IsForceOpen?: boolean
    readonly ClearForceOpen?: boolean
  }
  & OrderParametersByOrderType

// #region Types for order placement method 1
export type PlaceOrderParametersEntryWithNoRelatedOrders =
  & PlaceOrderParametersBase
  & {
    readonly RequestId?: undefined | string
  }

export const PlaceOrderResponseEntryWithNoRelatedOrders = props({
  OrderId: string(),
  ExternalReference: string(),
})

export interface PlaceOrderResponseEntryWithNoRelatedOrders
  extends GuardType<typeof PlaceOrderResponseEntryWithNoRelatedOrders> {}

// #endregion

// #region Types for order placement method 2
export type PlaceOrderParametersEntryWithOneRelatedOrder =
  & PlaceOrderParametersBase
  & {
    readonly RequestId?: undefined | string
    readonly Orders: readonly [
      PlaceOrderParametersBase,
    ]
  }

export const PlaceOrderResponseEntryWithOneRelatedOrder = props({
  OrderId: string(),
  ExternalReference: string(),
  Orders: tuple([
    props({
      OrderId: string(),
      ExternalReference: string(),
    }),
  ]),
})

export interface PlaceOrderResponseEntryWithOneRelatedOrder
  extends GuardType<typeof PlaceOrderResponseEntryWithOneRelatedOrder> {}

// #endregion

// #region Types for order placement method 3
export type PlaceOrderParametersEntryWithTwoRelatedOrders =
  & PlaceOrderParametersBase
  & {
    readonly RequestId?: undefined | string
    readonly Orders: readonly [
      // First order must be a limit order
      & { readonly ExternalReference: string }
      & (PlaceOrderParametersBase & { readonly OrderType: 'Limit' }),

      // Second order cannot be a limit order
      & { readonly ExternalReference: string }
      & Exclude<PlaceOrderParametersBase, { readonly OrderType: 'Limit' }>,
    ]
  }

export const PlaceOrderResponseEntryWithTwoRelatedOrders = props({
  OrderId: string(),
  ExternalReference: string(),
  Orders: tuple([
    props({
      OrderId: string(),
      ExternalReference: string(),
    }),
    props({
      OrderId: string(),
      ExternalReference: string(),
    }),
  ]),
})

export interface PlaceOrderResponseEntryWithTwoRelatedOrders
  extends GuardType<typeof PlaceOrderResponseEntryWithTwoRelatedOrders> {}

// #endregion

// #region Types for order placement method 5
export type PlaceOrderParametersOneRelatedOrderForOrder =
  & {
    readonly RequestId?: undefined | string
    readonly OrderId: string
  }
  & {
    readonly Orders: readonly [
      PlaceOrderParametersBase,
    ]
  }

export const PlaceOrderResponseOneRelatedOrderForOrder = props({
  OrderId: string(),
  Orders: tuple([
    props({
      OrderId: string(),
      ExternalReference: string(),
    }),
  ]),
})

export interface PlaceOrderResponseOneRelatedOrderForOrder
  extends GuardType<typeof PlaceOrderResponseOneRelatedOrderForOrder> {}
// #endregion

// #region Types for order placement method 6
export type PlaceOrderParametersTwoRelatedOrdersForOrder =
  & {
    readonly RequestId?: undefined | string
    readonly OrderId: string
  }
  & {
    readonly Orders: readonly [
      // First order must be a limit order
      & { readonly ExternalReference: string }
      & (PlaceOrderParametersBase & { readonly OrderType: 'Limit' }),

      // Second order cannot be a limit order
      & { readonly ExternalReference: string }
      & Exclude<PlaceOrderParametersBase, { readonly OrderType: 'Limit' }>,
    ]
  }

export const PlaceOrderResponseTwoRelatedOrdersForOrder = props({
  OrderId: string(),
  Orders: tuple([
    props({
      OrderId: string(),
      ExternalReference: string(),
    }),
    props({
      OrderId: string(),
      ExternalReference: string(),
    }),
  ]),
})

export interface PlaceOrderResponseTwoRelatedOrdersForOrder
  extends GuardType<typeof PlaceOrderResponseTwoRelatedOrdersForOrder> {}
// #endregion

// #region Types for order placement method 7
export type PlaceOrderParametersOneRelatedOrderForPosition =
  & {
    readonly RequestId?: undefined | string
    readonly PositionId: string
  }
  & {
    readonly Orders: readonly [
      PlaceOrderParametersBase,
    ]
  }

export const PlaceOrderResponseOneRelatedOrderForPosition = props({
  Orders: tuple([
    props({
      OrderId: string(),
      ExternalReference: string(),
    }),
  ]),
})

export interface PlaceOrderResponseOneRelatedOrderForPosition
  extends GuardType<typeof PlaceOrderResponseOneRelatedOrderForPosition> {}
// #endregion

// #region Types for order placement method 8
export type PlaceOrderParametersTwoRelatedOrdersForPosition =
  & {
    readonly RequestId?: undefined | string
    readonly PositionId: string
  }
  & {
    readonly Orders: readonly [
      // First order must be a limit order
      & { readonly ExternalReference: string }
      & (PlaceOrderParametersBase & { readonly OrderType: 'Limit' }),

      // Second order cannot be a limit order
      & { readonly ExternalReference: string }
      & Exclude<PlaceOrderParametersBase, { readonly OrderType: 'Limit' }>,
    ]
  }

export const PlaceOrderResponseTwoRelatedOrdersForPosition = props({
  Orders: tuple([
    props({
      OrderId: string(),
      ExternalReference: string(),
    }),
    props({
      OrderId: string(),
      ExternalReference: string(),
    }),
  ]),
})

export interface PlaceOrderResponseTwoRelatedOrdersForPosition
  extends GuardType<typeof PlaceOrderResponseTwoRelatedOrdersForPosition> {}
// #endregion

// #region Types for order placement method 9
export type PlaceOrderParametersEntryOCOOrders = {
  readonly RequestId?: undefined | string
  readonly Orders: readonly [
    // First order must be a limit order
    & { readonly ExternalReference: string }
    & (PlaceOrderParametersBase & { readonly OrderType: 'Limit' }),

    // Second order cannot be a limit order
    & { readonly ExternalReference: string }
    & Exclude<PlaceOrderParametersBase, { readonly OrderType: 'Limit' }>,
  ]
}

export const PlaceOrderResponseEntryOCOOrders = props({
  Orders: tuple([
    props({
      OrderId: string(),
      ExternalReference: string(),
    }),
    props({
      OrderId: string(),
      ExternalReference: string(),
    }),
  ]),
})

export interface PlaceOrderResponseEntryOCOOrders extends GuardType<typeof PlaceOrderResponseEntryOCOOrders> {}

// #endregion

// #region Types for order placement response (union)
const PlaceOrderResponse = union([
  PlaceOrderResponseEntryWithNoRelatedOrders,
  PlaceOrderResponseEntryWithOneRelatedOrder,
  PlaceOrderResponseEntryWithTwoRelatedOrders,
  PlaceOrderResponseEntryOCOOrders,
  PlaceOrderResponseOneRelatedOrderForOrder,
  PlaceOrderResponseTwoRelatedOrdersForOrder,
])

export type PlaceOrderResponse = GuardType<typeof PlaceOrderResponse>
// #endregion

// #region Types for order cancellation
export const CancelSpecificOrdersResponse = props({
  Orders: array(Order),
})

export interface CancelSpecificOrdersResponse extends GuardType<typeof CancelSpecificOrdersResponse> {}

export const CancelMatchingOrdersResponse = optional(props({
  ErrorInfo: StringErrorResponse,
}))

export type CancelMatchingOrdersResponse = GuardType<typeof CancelMatchingOrdersResponse>

const CancelOrdersResponse = union([CancelMatchingOrdersResponse, CancelSpecificOrdersResponse])

type CancelOrdersResponse = GuardType<typeof CancelOrdersResponse>
// #endregion

export class Orders {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v2/orders')
  }

  /**
   * Method 1:
   * Placing a single order, with no related orders.
   */
  async post(
    parameters: PlaceOrderParametersEntryWithNoRelatedOrders,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderResponseEntryWithNoRelatedOrders>

  /**
   * Method 2:
   * Placing a single order, with one related order that will be activated after the first order is filled.
   */
  async post(
    parameters: PlaceOrderParametersEntryWithOneRelatedOrder,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderResponseEntryWithOneRelatedOrder>

  /**
   * Method 3:
   * Placing a single order, with two related orders that will be activated after the first order is filled.
   */
  async post(
    parameters: PlaceOrderParametersEntryWithTwoRelatedOrders,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderResponseEntryWithTwoRelatedOrders>

  /**
   * Method 4:
   * Placing a single related order to an existing order.
   */
  async post(
    parameters: PlaceOrderParametersOneRelatedOrderForOrder,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderResponseOneRelatedOrderForOrder>

  /**
   * Method 5:
   * Placing two related orders to an existing order.
   *
   * One order must be a limit order
   * The second order cannot be a limit order (it must either be a stop or stop-limit order)
   */
  async post(
    parameters: PlaceOrderParametersTwoRelatedOrdersForOrder,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderResponseTwoRelatedOrdersForOrder>

  /**
   * Method 6:
   * Placing a single related order to an existing position.
   *
   * Note that this requires the client netting mode to be "end of day"
   */
  async post(
    parameters: PlaceOrderParametersOneRelatedOrderForOrder,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderResponseOneRelatedOrderForOrder>

  /**
   * Method 7:
   * Placing two related orders to an existing position.
   *
   * One order must be a limit order
   * The second order cannot be a limit order (it must either be a stop or stop-limit order)
   *
   * Note that this requires the client netting mode to be "end of day"
   */
  async post(
    parameters: PlaceOrderParametersTwoRelatedOrdersForOrder,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderResponseTwoRelatedOrdersForOrder>

  /**
   * Method 8:
   * Placing two orders that are OCO (One Cancels Other) orders.
   * When one order is filled, the other is automatically cancelled.
   */
  async post(
    parameters: PlaceOrderParametersEntryOCOOrders,
    options?: { readonly timeout?: undefined | number },
  ): Promise<PlaceOrderResponseEntryOCOOrders>

  /**
   * Placing orders can be done in several ways.
   * Each of these methods have their own specific requirements and limitations - see the descriptions above.
   *
   * Please note that the placing the following order types are not supported by this implementation:
   * - Algorithmic orders, i.e. "Iceberg"-algorithm
   * - Condition-orders, i.e. order types "TriggerBreakout", "TriggerLimit", and, "TriggerStop"
   */
  async post(
    { RequestId, ...parameters }:
      | PlaceOrderParametersEntryWithNoRelatedOrders
      | PlaceOrderParametersEntryWithOneRelatedOrder
      | PlaceOrderParametersEntryWithTwoRelatedOrders
      | PlaceOrderParametersOneRelatedOrderForOrder
      | PlaceOrderParametersTwoRelatedOrdersForOrder
      | PlaceOrderParametersOneRelatedOrderForPosition
      | PlaceOrderParametersTwoRelatedOrdersForPosition
      | PlaceOrderParametersEntryOCOOrders,
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<
    | PlaceOrderResponseEntryWithNoRelatedOrders
    | PlaceOrderResponseEntryWithOneRelatedOrder
    | PlaceOrderResponseEntryWithTwoRelatedOrders
    | PlaceOrderResponseOneRelatedOrderForOrder
    | PlaceOrderResponseTwoRelatedOrdersForOrder
    | PlaceOrderResponseOneRelatedOrderForPosition
    | PlaceOrderResponseTwoRelatedOrdersForPosition
    | PlaceOrderResponseEntryOCOOrders
  > {
    const hasRootExternalReference = 'ExternalReference' in parameters
    const relatedOrders = 'Orders' in parameters ? parameters.Orders.length : undefined

    const body = parameters
    const headers = RequestId === undefined ? undefined : {
      'x-request-id': RequestId,
    }

    // Method 1
    if (hasRootExternalReference && relatedOrders === undefined) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseEntryWithNoRelatedOrders,
        timeout: options.timeout,
      }).execute()
    }

    // Method 2
    if (hasRootExternalReference && relatedOrders === 1) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseEntryWithOneRelatedOrder,
        timeout: options.timeout,
      }).execute()
    }

    // Method 3
    if (hasRootExternalReference && relatedOrders === 2) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseEntryWithTwoRelatedOrders,
        timeout: options.timeout,
      }).execute()
    }

    // Method 4
    if ('OrderId' in parameters && relatedOrders === 1) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseOneRelatedOrderForOrder,
        timeout: options.timeout,
      }).execute()
    }

    // Method 5
    if ('OrderId' in parameters && relatedOrders === 2) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseTwoRelatedOrdersForOrder,
        timeout: options.timeout,
      }).execute()
    }

    // Method 6
    if ('PositionId' in parameters && relatedOrders === 1) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseOneRelatedOrderForPosition,
        timeout: options.timeout,
      }).execute()
    }

    // Method 7
    if ('PositionId' in parameters && relatedOrders === 2) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseTwoRelatedOrdersForPosition,
        timeout: options.timeout,
      }).execute()
    }

    // Method 8
    if (hasRootExternalReference === false && relatedOrders === 2) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseEntryOCOOrders,
        timeout: options.timeout,
      }).execute()
    }

    throw new Error('Unexpected response')
  }

  /**
   * Cancels all orders for requested instrument and account.
   */
  async delete(
    parameters: {
      readonly AccountKey: string
      readonly AssetType: AssetType
      readonly Uic: number
    },
    options?: { readonly timeout?: undefined | number },
  ): Promise<CancelMatchingOrdersResponse>

  /**
   * Cancels one or more orders.
   */
  async delete(
    parameters: {
      readonly AccountKey: string
      readonly OrderIds: readonly string[]
    },
    options?: { readonly timeout?: undefined | number },
  ): Promise<CancelSpecificOrdersResponse>

  async delete(
    parameters: {
      readonly AccountKey: string
      readonly OrderIds: readonly string[]
    } | {
      readonly AccountKey: string
      readonly AssetType: AssetType
      readonly Uic: number
    },
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<CancelOrdersResponse> {
    if ('Uic' in parameters) {
      return await this.#client.delete({
        searchParams: {
          AccountKey: parameters.AccountKey,
          AssetType: parameters.AssetType,
          Uic: parameters.Uic,
        },
        guard: CancelOrdersResponse,
        timeout: options.timeout,
      }).execute()
    }

    return await this.#client.delete({
      path: parameters.OrderIds.join(','),
      searchParams: {
        AccountKey: parameters.AccountKey,
      },
      guard: CancelOrdersResponse,
      timeout: options.timeout,
    }).execute()
  }
}
