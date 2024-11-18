import {
  array,
  type GuardType,
  optional,
  props,
  string,
  tuple,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

import type { ServiceGroupClient } from '../../service-group-client.ts'
import type { AssetType } from '../../types/derives/asset-type.ts'
import type { BuySell } from '../../types/derives/buy-sell.ts'
import type { OrderDuration } from '../../types/records/order-duration.ts'
import { Order } from '../../types/records/order.ts'
import { StringErrorResponse } from '../../types/records/string-error-response.ts'

// todo implement arguments:
// AccountKey	AccountKey	Body	Unique key identifying the account to place the order on.
// todo AlgoOrderData	AlgorithmicOrderData	Body	Specification of StrategyName and parameters for AlgoOrders. Note: AlgoOrders are only supported on the live system.
// todo AllocationKeyId	String	Body	Set AllocationKey if block trade on IB account.
// Amount	Number	Body	Order size.
// todo AmountType	OrderAmountType	Body	Indicates if the order Amount is specified as lots/shares/contracts or as a monetary purchase amount in instrument currency. If CurrencyAmount, then use CashAmount. Defaults to Quantity Currently only supported on MutualFunds
// AssetType	AssetType	Body	The Instruments AssetType.
// BuySell	BuySell	Body	The direction of the order; buy or sell.
// CancelOrders	Boolean	Body	If set True, it will cancel all orders placed against the instrument of this order.
// ClearForceOpen	Boolean	Body	If set True, it will clear the ForceOpen flag for all positions belongs to instrument of this order.And will be set to True implicitly if not set explicitly resulting cancel all orders against the instrument of this order.
// todo DealCapture 	DealCapture	Body	Deal capture information, only applicable for DealCaptures orders.
// todo DecisionMakerUserID	String	Body	The ID of the user who has accepted the advice to place an order.
// ExternalReference	String	Body	Optional reference from the app, to correlate orders with Saxo Bank issues order IDs. Maximum length: 50 characters. The order will be rejected if the reference is too long. This reference doesn’t have to be unique. // todo if specified, should also be included in the return type
// todo ForwardDate	Date	Body	Forward date that is only used for FxForward entry orders (no OCO, no related orders).
// IsForceOpen	Boolean	Body	If true, the order's resulting position will only be netted with positions in the opposite direction when explicitly closed.
// ManualOrder	Boolean	Body	Indicator for whether order is placed automatically or manually.
// OrderDuration	OrderDuration	Body	The Order Duration.
// OrderId	String	Body	Used when placing related orders for an existing order.
// OrderPrice	Number	Body	Order Price. Optional for market orders.
// Orders	PlaceRelatedOrOcoOrder []	Body	Optional related orders or OCO orders.
// OrderType	PlaceableOrderType	Body	Order type.
// PositionId	String	Body	Used when placing related orders for an existing position.
// todo QuoteCurrency	Boolean	Body	Indicates whether order request is done in quote (2nd) currency. (FxSpot only).
// StopLimitPrice	Number	Body	Stop limit price for Stop Limit order
// todo SwitchInstrumentUic	Integer	Body	The Uic of the instrument to be used for Switch And Traspaso orders, Mutual Funds Specific
// todo ToOpenClose	ToOpenClose	Body	Whether the order should be created to open/increase or close/decrease a position. (Only relevant for options)
// todo TraderId	String	Body	Trader Id, Used only if the application is configured for supporting it with length of 2-16 chars.
// TrailingStopDistanceToMarket	Number	Body	Distance to market for a trailing stop order.
// TrailingStopStep	Number	Body	Step size for trailing stop order.
// todo TraspasoIn	TraspasoInDetails	Body	Information about Traspaso in external source instrument
// Uic	Integer	Body	Unique id of the instrument to place the order for.
// WithAdvice	Boolean	Body	Indicates whether order is placed with advice to client.

type OrderParametersByOrderType = {
  readonly OrderType: 'Market'
} | {
  readonly OrderType: 'Limit'
  readonly OrderPrice: number
} | {
  readonly OrderType: 'Stop'
  readonly OrderPrice: number
} | {
  readonly OrderType: 'StopIfTraded'
  readonly OrderPrice: number
} | {
  readonly OrderType: 'StopLimit'
  readonly OrderPrice: number
  readonly StopLimitPrice: number
} | {
  readonly OrderType: 'TrailingStop'
  readonly OrderPrice: number
  readonly TrailingStopStep: number
  readonly TrailingStopDistanceToMarket: number
} | {
  readonly OrderType: 'TrailingStopIfTraded'
  readonly OrderPrice: number
  readonly TrailingStopStep: number
  readonly TrailingStopDistanceToMarket: number
}

type OrderParametersByAssetType =
  | {
    readonly AssetType: Extract<
      AssetType,
      | 'Bond'
      | 'CfdOnIndex'
      | 'CompanyWarrant'
      | 'CfdOnCompanyWarrant'
      | 'Stock'
      | 'CfdOnStock'
      | 'StockIndexOption'
      | 'StockOption'
      | 'ContractFutures'
      | 'CfdOnFutures'
      | 'Etc'
      | 'CfdOnEtc'
      | 'Etf'
      | 'CfdOnEtf'
      | 'Etn'
      | 'CfdOnEtn'
      | 'Fund'
      | 'CfdOnFund'
      | 'FuturesOption'
      | 'FxNoTouchOption'
      | 'FxOneTouchOption'
      | 'FxSpot'
      | 'FxSwap'
      | 'FxVanillaOption'
      | 'Rights'
      | 'CfdOnRights'
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
      })
    }

    // Method 2
    if (hasRootExternalReference && relatedOrders === 1) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseEntryWithOneRelatedOrder,
        timeout: options.timeout,
      })
    }

    // Method 3
    if (hasRootExternalReference && relatedOrders === 2) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseEntryWithTwoRelatedOrders,
        timeout: options.timeout,
      })
    }

    // Method 4
    if ('OrderId' in parameters && relatedOrders === 1) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseOneRelatedOrderForOrder,
        timeout: options.timeout,
      })
    }

    // Method 5
    if ('OrderId' in parameters && relatedOrders === 2) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseTwoRelatedOrdersForOrder,
        timeout: options.timeout,
      })
    }

    // Method 6
    if ('PositionId' in parameters && relatedOrders === 1) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseOneRelatedOrderForPosition,
        timeout: options.timeout,
      })
    }

    // Method 7
    if ('PositionId' in parameters && relatedOrders === 2) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseTwoRelatedOrdersForPosition,
        timeout: options.timeout,
      })
    }

    // Method 8
    if (hasRootExternalReference === false && relatedOrders === 2) {
      return await this.#client.post({
        body,
        headers,
        guard: PlaceOrderResponseEntryOCOOrders,
        timeout: options.timeout,
      })
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
        timeout: options.timeout,
      })
    }

    return await this.#client.delete({
      path: parameters.OrderIds.join(','),
      searchParams: {
        AccountKey: parameters.AccountKey,
      },
      timeout: options.timeout,
    })
  }
}
