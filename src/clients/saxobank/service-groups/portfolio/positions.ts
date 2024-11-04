import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import type { PositionFieldGroup } from '../../types/derives/position-field-group.ts'
import { PositionResponse } from '../../types/records/position-response.ts'

const FieldGroups: PositionFieldGroup[] = [
  'Costs',
  'DisplayAndFormat',
  'ExchangeInfo',
  'Greeks',
  'PositionBase',
  'PositionIdOnly',
  'PositionView',
]

export class Positions {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/positions')
  }

  async *get(
    {
      AccountGroupKey,
      AccountKey,
      ClientKey,
      NetPositionId,
      PositionId,
      WatchlistId,
    }: {
      /** The key of the account group to which the net positions belongs. */
      readonly AccountGroupKey?: undefined | string

      /** The key of the account to which the net positions belongs. */
      readonly AccountKey?: undefined | string

      /** The key of the client to which the net positions belongs. */
      readonly ClientKey: string

      /** The id of the netposition to which the position belongs */
      readonly NetPositionId?: undefined | string

      /** The id of the position. */
      readonly PositionId?: undefined | string

      /** Selects only positions those instruments belongs to the given watchlist id */
      readonly WatchlistId?: undefined | string
    },
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<PositionResponse, void, undefined> {
    yield* this.#client.getPaginated({
      searchParams: {
        AccountGroupKey,
        AccountKey,
        ClientKey,
        NetPositionId,
        PositionId,
        WatchlistId,
        FieldGroups,
      },
      guard: PositionResponse,
      timeout: options.timeout,
    }).execute()
  }
}
