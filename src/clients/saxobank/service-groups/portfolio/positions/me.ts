import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import type { PositionFieldGroup } from '../../../types/derives/position-field-group.ts'
import { PositionResponse } from '../../../types/records/position-response.ts'

const FieldGroups: PositionFieldGroup[] = [
  'Costs',
  'DisplayAndFormat',
  'ExchangeInfo',
  'Greeks',
  'PositionBase',
  'PositionIdOnly',
  'PositionView',
]

export class Me {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('me')
  }

  async *get(
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<PositionResponse, void, undefined> {
    yield* this.#client.getPaginated({
      searchParams: {
        FieldGroups,
      },
      guard: PositionResponse,
      timeout: options.timeout,
    }).execute()
  }
}
