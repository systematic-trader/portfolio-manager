import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import type { OrderFieldGroup } from '../../types/derives/order-field-group.ts'
import type { OrderStatusFilter } from '../../types/derives/order-status-filter.ts'
import { OrderResponse } from '../../types/records/order-response.ts'

const FieldGroups: OrderFieldGroup[] = [
  'DisplayAndFormat',
  'ExchangeInfo',
  'Greeks',
]

export class Orders {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/orders')
  }

  /**
   * You can use this operation to get all the open orders on an account or a client.
   */
  async *get(
    {
      AccountGroupKey,
      AccountKey,
      ClientKey,
      OrderId,
      Status,
      WatchlistId,
    }: {
      /** The key of the account group to which the order belongs. */
      readonly AccountGroupKey?: undefined | string

      /** Unique key identifying the account that owns the orders. */
      readonly AccountKey?: undefined | string

      /** Unique key identifying the client that owns the orders. */
      readonly ClientKey: string

      /** The id of the order */
      readonly OrderId?: undefined | string

      /**
       * Selects only a subset of open orders to be returned.
       * Default is to return working orders only.
       */
      readonly Status?: undefined | OrderStatusFilter

      /** Selects only orders those instruments belongs to the given watchlist id */
      readonly WatchlistId?: undefined | string
    },
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<OrderResponse, void, undefined> {
    yield* this.#client.getPaginated({
      searchParams: {
        FieldGroups,
        AccountGroupKey,
        AccountKey,
        ClientKey,
        OrderId,
        Status,
        WatchlistId,
      },
      guard: OrderResponse,
      timeout: options.timeout,
    }).execute()
  }
}
