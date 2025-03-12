import {
  type GuardType,
  literal,
  optional,
  props,
  string,
  tuple,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import type {
  OrderParametersByOrderType,
  OrderParametersByTimeInForce,
  OrderParametersStatic,
} from '../../../types/derived/order-parameters.ts'
import { OrderStatus } from '../../../types/derived/order-status.ts'
import { DeleteOrderResponse } from '../../../types/record/delete-order-response.ts'

export const OrderModifiedResponse = tuple([
  props({
    order_id: string(),
    local_order_id: string(), // corresponds to the original cOID specified when placing the order
    order_status: OrderStatus,
    encrypt_message: optional(literal('1')),
  }),
])

export interface OrderModifiedResponse extends GuardType<typeof OrderModifiedResponse> {}

export class Order {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  async post({ orderId, ...body }:
    & {
      readonly orderId: number | string
    }
    & Omit<OrderParametersStatic, 'acctId' | 'cOID'>
    & OrderParametersByOrderType
    & OrderParametersByTimeInForce, { signal, timeout }: {
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
    } = {}): Promise<OrderModifiedResponse> {
    return await this.#client.post({
      path: `${this.#client.accountID}/order/${orderId}`,
      body,
      guard: OrderModifiedResponse,
      signal,
      timeout,
    })
  }

  async delete({ orderId, manualIndicator }: {
    readonly orderId: number | string
    readonly manualIndicator: boolean
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<DeleteOrderResponse> {
    return await this.#client.delete({
      path: `${this.#client.accountID}/order/${orderId}`,
      searchParams: {
        manualIndicator,
      },
      guard: DeleteOrderResponse,
      signal,
      timeout,
    })
  }
}
