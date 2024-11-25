import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import type { ClosedPositionFieldGroup } from '../../../types/derives/closed-position-field-group.ts'
import { ClosedPositionResponse } from '../../../types/records/closed-position-response.ts'

const FieldGroups: ClosedPositionFieldGroup[] = [
  'ClosedPosition',
  'ClosedPositionDetails',
  'DisplayAndFormat',
  'ExchangeInfo',
]
export class Me {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('me')
  }

  /** Returns a list of closed positions fulfilling the criteria specified by the query string parameters. */
  async *get(
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<ClosedPositionResponse, void, undefined> {
    yield* this.#client.getPaginated({
      searchParams: {
        FieldGroups,
      },
      guard: ClosedPositionResponse,
      timeout: options.timeout,
    }).execute()
  }
}
