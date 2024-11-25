import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { CultureDetails } from '../../types/records/culture-details.ts'

export class Cultures {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/cultures')
  }

  async *get(
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<CultureDetails, void, undefined> {
    yield* this.#client.getPaginated({
      guard: CultureDetails,
      timeout: options.timeout,
    }).execute()
  }
}
