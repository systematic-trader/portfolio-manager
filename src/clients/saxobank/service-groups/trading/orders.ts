import {
  array,
  assertReturn,
  type GuardType,
  optional,
  props,
  string,
  tuple,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

import { HTTPClientError } from '../../../http-client.ts'
import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import type { AssetType } from '../../types/derives/asset-type.ts'
import type { BuySell } from '../../types/derives/buy-sell.ts'
import { CancelOrdersByIdErrorCode } from '../../types/records/cancel-orders-by-id-error-code.ts'
import { CancelOrdersByInstrumentErrorCode } from '../../types/records/cancel-orders-by-instrument-error-code.ts'
import type { OrderDuration } from '../../types/records/order-duration.ts'

// #region Order placement
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

type OrderParametersByAssetType =
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
  & OrderParametersByAssetType
  & {
    readonly AccountKey?: undefined | string
    readonly Amount: number
    readonly BuySell: BuySell
    readonly CancelOrders?: undefined | boolean
    readonly ClearForceOpen?: undefined | boolean
    readonly ExternalReference: string
    readonly IsForceOpen?: undefined | boolean
    readonly ManualOrder: boolean
    readonly Uic: number
    readonly WithAdvice?: undefined | boolean
  }
  & OrderParametersByOrderType

type UpdateOrderParametersBase =
  & OrderParametersByAssetType
  & {
    readonly AccountKey?: undefined | string
    readonly Amount?: undefined | number
    readonly IsForceOpen?: undefined | boolean
    readonly OrderId: string
  }
  & OrderParametersByOrderType
// #endregion

// #region Order placement method 1
export type PlaceOrderParametersEntryWithNoRelatedOrders =
  & PlaceOrderParametersBase
  & {
    readonly RequestId?: undefined | string
    readonly Orders?: undefined
  }

export const PlaceOrderResponseEntryWithNoRelatedOrders = props({
  OrderId: string(),
  ExternalReference: string(),
})

export interface PlaceOrderResponseEntryWithNoRelatedOrders
  extends GuardType<typeof PlaceOrderResponseEntryWithNoRelatedOrders> {}
// #endregion

// #region Order placement method 2
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

// #region Order placement method 3
export type PlaceOrderParametersEntryWithTwoRelatedOrders =
  & PlaceOrderParametersBase
  & {
    readonly RequestId?: undefined | string
    readonly Orders: readonly [
      // First order must be a limit order
      & { readonly ExternalReference: string }
      & (PlaceOrderParametersBase & { readonly OrderType: 'Limit' }),

      // Second order cannot be a limit or market order
      & { readonly ExternalReference: string }
      & Exclude<PlaceOrderParametersBase, { readonly OrderType: 'Limit' | 'Market' }>,
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

// #region Order placement method 4
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

// #region Order placement method 5
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

      // Second order cannot be a limit or market order
      & { readonly ExternalReference: string }
      & Exclude<PlaceOrderParametersBase, { readonly OrderType: 'Limit' | 'Market' }>,
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

// #region Order placement method 6
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

// #region Order placement method 7
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

      // Second order cannot be a limit or market order
      & { readonly ExternalReference: string }
      & Exclude<PlaceOrderParametersBase, { readonly OrderType: 'Limit' | 'Market' }>,
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

// #region Order placement method 8
export type PlaceOrderParametersEntryOCOOrders = {
  readonly RequestId?: undefined | string
  readonly Orders: readonly [
    // First order must be a limit order
    & { readonly ExternalReference: string }
    & (PlaceOrderParametersBase & { readonly OrderType: 'Limit' }),

    // Second order cannot be a limit or market order
    & { readonly ExternalReference: string }
    & Exclude<PlaceOrderParametersBase, { readonly OrderType: 'Limit' | 'Market' }>,
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

// #region Order placement union
export type PlaceOrderParameters =
  | PlaceOrderParametersEntryWithNoRelatedOrders
  | PlaceOrderParametersEntryWithOneRelatedOrder
  | PlaceOrderParametersEntryWithTwoRelatedOrders
  | PlaceOrderParametersOneRelatedOrderForOrder
  | PlaceOrderParametersTwoRelatedOrdersForOrder
  | PlaceOrderParametersOneRelatedOrderForPosition
  | PlaceOrderParametersTwoRelatedOrdersForPosition
  | PlaceOrderParametersEntryOCOOrders
// #endregion

// #region Order placement response (union)
const PlaceOrderResponse = union([
  PlaceOrderResponseEntryWithNoRelatedOrders,
  PlaceOrderResponseEntryWithOneRelatedOrder,
  PlaceOrderResponseEntryWithTwoRelatedOrders,
  PlaceOrderResponseOneRelatedOrderForOrder,
  PlaceOrderResponseTwoRelatedOrdersForOrder,
  PlaceOrderResponseOneRelatedOrderForPosition,
  PlaceOrderResponseTwoRelatedOrdersForPosition,
  PlaceOrderResponseEntryOCOOrders,
])

export type PlaceOrderResponse = GuardType<typeof PlaceOrderResponse>
// #endregion

// #region Order update method 1
export type UpdateOrderParametersEntryWithNoRelatedOrders =
  & UpdateOrderParametersBase
  & {
    readonly AccountKey: string
    readonly RequestId?: undefined | string
  }

export const UpdateOrderResponseEntryWithNoRelatedOrders = props({
  OrderId: string(),
})

export interface UpdateOrderResponseEntryWithNoRelatedOrders
  extends GuardType<typeof UpdateOrderResponseEntryWithNoRelatedOrders> {}
// #endregion

// #region Order update method 2
export type UpdateOrderParametersEntryWithOneRelatedOrder =
  & UpdateOrderParametersBase
  & {
    readonly RequestId?: undefined | string
    readonly Orders: readonly [
      UpdateOrderParametersBase,
    ]
  }

export const UpdateOrderResponseEntryWithOneRelatedOrder = props({
  OrderId: string(),
  Orders: tuple([
    props({
      OrderId: string(),
    }),
  ]),
})

export interface UpdateOrderResponseEntryWithOneRelatedOrder
  extends GuardType<typeof UpdateOrderResponseEntryWithOneRelatedOrder> {}
// #endregion

// #region Order update method 3
export type UpdateOrderParametersEntryWithTwoRelatedOrders =
  & UpdateOrderParametersBase
  & {
    readonly RequestId?: undefined | string
    readonly Orders: readonly [
      // First order must be a limit order
      (UpdateOrderParametersBase & { readonly OrderType: 'Limit' }),

      // Second order cannot be a limit or market order
      Exclude<UpdateOrderParametersBase, { readonly OrderType: 'Limit' | 'Market' }>,
    ]
  }

export const UpdateOrderResponseEntryWithTwoRelatedOrders = props({
  OrderId: string(),
  Orders: tuple([
    props({
      OrderId: string(),
    }),
    props({
      OrderId: string(),
    }),
  ]),
})

export interface UpdateOrderResponseEntryWithTwoRelatedOrders
  extends GuardType<typeof UpdateOrderResponseEntryWithTwoRelatedOrders> {}
// #endregion

// #region Order update response (union)
const UpdateOrderResponse = union([
  UpdateOrderResponseEntryWithNoRelatedOrders,
  UpdateOrderResponseEntryWithOneRelatedOrder,
  UpdateOrderResponseEntryWithTwoRelatedOrders,
])

export type UpdateOrderResponse = GuardType<typeof UpdateOrderResponse>
// #endregion

// #region Order cancellation

export interface CancelOrdersByIdParameters {
  readonly AccountKey: string
  readonly OrderIds: readonly string[]
}

export const CancelOrdersByIdResponse = props({
  Orders: array(props({
    OrderId: string(),
    ErrorInfo: optional(props({
      ErrorCode: CancelOrdersByIdErrorCode,
      Message: string(),
    })),
  })),
})

export interface CancelOrdersByIdResponse extends GuardType<typeof CancelOrdersByIdResponse> {}

export interface CancelOrdersByInstrumentParameters {
  readonly AccountKey: string
  readonly AssetType: AssetType
  readonly Uic: number
}

export const CancelOrdersByInstrumentResponse = optional(props({
  ErrorInfo: props({
    ErrorCode: CancelOrdersByInstrumentErrorCode,
    Message: string(),
  }),
}))

export type CancelOrdersByInstrumentResponse = GuardType<typeof CancelOrdersByInstrumentResponse>

const CancelOrdersResponse = union([
  CancelOrdersByInstrumentResponse,
  CancelOrdersByIdResponse,
])

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
   *
   * Also note that the OpenAPI only allows for 1 request to be made each second.
   * Performing multiple requests in quick succession will result in a 429 response - and this is fine - and the client will automatically retry the request.
   * However, when re-trying the request, the client will use the same x-request-id as the original request (if specified through the RequestId parameter).
   * Based on testing on the simulation environment, it seems that this can cause requests to be rejected by OpenAPi (since the x-request-id must be unique).
   * When this happens, the response will be have a http status code 400 and the body will contain an error message stating "repeated request on auto quote".
   * You can circumvent this entire problem by simply slowing down your request rate to, at most, 1 request per second.
   * See also https://www.developer.saxo/openapi/learn/rate-limiting#RateLimiting-Preventingduplicateorderoperations
   */
  async post(
    { RequestId, ...parameters }: PlaceOrderParameters,
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<PlaceOrderResponse> {
    const hasRootExternalReference = 'ExternalReference' in parameters
    const relatedOrders = parameters.Orders?.length

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
   * Method 1:
   * Updates a single order, with no related orders.
   */
  async patch(
    parameters: UpdateOrderParametersEntryWithNoRelatedOrders,
    options?: { readonly timeout?: undefined | number },
  ): Promise<UpdateOrderResponseEntryWithNoRelatedOrders>

  /**
   * Method 2:
   * Updates a single order, with one related order that will be activated after the first order is filled.
   */
  async patch(
    parameters: UpdateOrderParametersEntryWithOneRelatedOrder,
    options?: { readonly timeout?: undefined | number },
  ): Promise<UpdateOrderResponseEntryWithOneRelatedOrder>

  /**
   * Method 3:
   * Updates a single order, with two related orders that will be activated after the first order is filled.
   */
  async patch(
    parameters: UpdateOrderParametersEntryWithTwoRelatedOrders,
    options?: { readonly timeout?: undefined | number },
  ): Promise<UpdateOrderResponseEntryWithTwoRelatedOrders>

  /**
   * Updating orders can be done in several ways.
   * Each of these methods have their own specific requirements and limitations - see the descriptions above.
   */
  async patch(
    { RequestId, ...parameters }:
      | UpdateOrderParametersEntryWithNoRelatedOrders
      | UpdateOrderParametersEntryWithOneRelatedOrder
      | UpdateOrderParametersEntryWithTwoRelatedOrders,
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<
    | UpdateOrderResponseEntryWithNoRelatedOrders
    | UpdateOrderResponseEntryWithOneRelatedOrder
    | UpdateOrderResponseEntryWithTwoRelatedOrders
  > {
    const relatedOrders = 'Orders' in parameters ? parameters.Orders.length : undefined

    const body = parameters
    const headers = RequestId === undefined ? undefined : {
      'x-request-id': RequestId,
    }

    // Method 1
    if (relatedOrders === undefined) {
      return await this.#client.patch({
        body,
        headers,
        guard: UpdateOrderResponseEntryWithNoRelatedOrders,
        timeout: options.timeout,
      }).execute()
    }

    // Method 2
    if (relatedOrders === 1) {
      return await this.#client.patch({
        body,
        headers,
        guard: UpdateOrderResponseEntryWithOneRelatedOrder,
        timeout: options.timeout,
      }).execute()
    }

    // Method 3
    if (relatedOrders === 2) {
      return await this.#client.patch({
        body,
        headers,
        guard: UpdateOrderResponseEntryWithTwoRelatedOrders,
        timeout: options.timeout,
      }).execute()
    }

    throw new Error('Unexpected response')
  }

  /**
   * Cancels all orders for requested instrument and account.
   */
  async delete(
    parameters: CancelOrdersByInstrumentParameters,
    options?: { readonly timeout?: undefined | number },
  ): Promise<CancelOrdersByInstrumentResponse>

  /**
   * Cancels one or more orders.
   */
  async delete(
    parameters: CancelOrdersByIdParameters,
    options?: { readonly timeout?: undefined | number },
  ): Promise<CancelOrdersByIdResponse>

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
    // If there is a uic in the parameters, we know that we are cancelling orders by instrument.
    if ('Uic' in parameters) {
      try {
        return await this.#client.delete({
          searchParams: {
            AccountKey: parameters.AccountKey,
            AssetType: parameters.AssetType,
            Uic: parameters.Uic,
          },
          guard: CancelOrdersByInstrumentResponse,
          timeout: options.timeout,
        }).execute()
      } catch (error) {
        if (error instanceof HTTPClientError && [400, 404].includes(error.statusCode)) {
          return assertReturn(CancelOrdersByInstrumentResponse, error.body)
        }

        throw error
      }
    }

    // Otherwise, there is no specific uic in the parameters, so we know that we are cancelling orders by id.
    try {
      return await this.#client.delete({
        path: parameters.OrderIds.join(','),
        searchParams: {
          AccountKey: parameters.AccountKey,
        },
        guard: CancelOrdersByIdResponse,
        timeout: options.timeout,
      }).execute()
    } catch (error) {
      if (error instanceof HTTPClientError && [400, 404].includes(error.statusCode)) {
        return assertReturn(CancelOrdersByIdResponse, error.body)
      }

      throw error
    }
  }
}
