import type { ServiceGroupClient } from '../../../service-group-client.ts'
import type { OrderFieldGroup } from '../../../types/derives/order-field-group.ts'
import type { OrderStatusFilter } from '../../../types/derives/order-status-filter.ts'
import { OrderResponse } from '../../../types/records/order-response.ts'

const FieldGroups: OrderFieldGroup[] = [
  'DisplayAndFormat',
  'ExchangeInfo',
  'Greeks',
]
export class Me {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('me')
  }

  /** You can use this operation to get all open orders across all accounts for the client to which the logged-in user belongs. */
  async *get({ MultiLegOrderId, Status }: {
    /** Return only multi-leg orders with the given common MultiLegOrderId. */
    readonly MultiLegOrderId?: undefined | string

    /**
     * Selects only a subset of open orders to be returned based on status of the open order.
     * Default is "Working" (i.e. orders related to working orders are excluded).
     */
    readonly Status?: undefined | OrderStatusFilter
  } = {}): AsyncIterable<OrderResponse, void, undefined> {
    yield* this.#client.getPaginated({
      searchParams: {
        FieldGroups,
        MultiLegOrderId,
        Status,
      },
      guard: OrderResponse,
    })
  }
}
