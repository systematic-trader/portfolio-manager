import { HTTPClientError } from '../../../../http-client.ts'
import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import { StandardDate } from '../../../types/records/standard-date.ts'

export class FxOptionExpiry {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('fxoptionexpiry')
  }

  async *get(
    { Uic }: { readonly Uic: number | string },
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<StandardDate, void, undefined> {
    try {
      yield* this.#client.getPaginated({
        path: `${Uic}`,
        guard: StandardDate,
        timeout: options.timeout,
      }).execute()
    } catch (error) {
      if (error instanceof HTTPClientError && error.statusCode === 404) {
        return
      }

      throw error
    }
  }
}
