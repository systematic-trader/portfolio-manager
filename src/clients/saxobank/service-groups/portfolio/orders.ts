import { assertReturn } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssertionError } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/src/guards/errors.ts'
import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import type { OrderFieldGroup } from '../../types/derives/order-field-group.ts'
import type { OrderStatusFilter } from '../../types/derives/order-status-filter.ts'
import {
  OrderResponseBond,
  OrderResponseCfdOnEtc,
  OrderResponseCfdOnEtf,
  OrderResponseCfdOnEtn,
  OrderResponseCfdOnFund,
  OrderResponseCfdOnFutures,
  OrderResponseCfdOnIndex,
  OrderResponseCfdOnStock,
  OrderResponseContractFutures,
  OrderResponseEtc,
  OrderResponseEtf,
  OrderResponseEtn,
  OrderResponseFund,
  OrderResponseFxSpot,
  OrderResponseStock,
  type OrderResponseUnion,
  OrderResponseUnknown,
} from '../../types/records/order-response.ts'

const FieldGroups: OrderFieldGroup[] = [
  'DisplayAndFormat',
  // 'ExchangeInfo', // There is a bug on simulation where empty strings will be returned for exchanges when this field is included (exchange info still seems to get included if it is omitted though)
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
  ): AsyncIterable<OrderResponseUnion, void, undefined> {
    const orders = this.#client.getPaginated<OrderResponseUnion>({
      searchParams: {
        FieldGroups,
        AccountGroupKey,
        AccountKey,
        ClientKey,
        OrderId,
        Status,
        WatchlistId,
      },
      timeout: options.timeout,
    }).execute()

    for await (const order of orders) {
      try {
        yield assertReturnOrderResponse(order)
      } catch (error) {
        if (error instanceof AssertionError) {
          // deno-lint-ignore no-console
          console.trace(error.invalidations)
        }

        throw error
      }
    }
  }
}

function assertReturnOrderResponse(
  order: OrderResponseUnion,
): OrderResponseUnion {
  switch (order.AssetType) {
    case 'Bond': {
      return assertReturn(OrderResponseBond, order)
    }

    case 'CfdOnEtc': {
      return assertReturn(OrderResponseCfdOnEtc, order)
    }

    case 'CfdOnEtf': {
      return assertReturn(OrderResponseCfdOnEtf, order)
    }

    case 'CfdOnEtn': {
      return assertReturn(OrderResponseCfdOnEtn, order)
    }

    case 'CfdOnFund': {
      return assertReturn(OrderResponseCfdOnFund, order)
    }

    case 'CfdOnFutures': {
      return assertReturn(OrderResponseCfdOnFutures, order)
    }

    case 'CfdOnIndex': {
      return assertReturn(OrderResponseCfdOnIndex, order)
    }

    case 'CfdOnStock': {
      return assertReturn(OrderResponseCfdOnStock, order)
    }

    case 'ContractFutures': {
      return assertReturn(OrderResponseContractFutures, order)
    }

    case 'Etc': {
      return assertReturn(OrderResponseEtc, order)
    }

    case 'Etf': {
      return assertReturn(OrderResponseEtf, order)
    }

    case 'Etn': {
      return assertReturn(OrderResponseEtn, order)
    }

    case 'Fund': {
      return assertReturn(OrderResponseFund, order)
    }

    case 'FxSpot': {
      return assertReturn(OrderResponseFxSpot, order)
    }

    case 'Stock': {
      return assertReturn(OrderResponseStock, order)
    }

    default: {
      return assertReturn(OrderResponseUnknown, order)
    }
  }
}
