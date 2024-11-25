import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { CountryDetails } from '../../types/records/country-details.ts'

export class Countries {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/countries')
  }

  async *get(
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<CountryDetails, void, undefined> {
    yield* this.#client.getPaginated({
      guard: CountryDetails,
      timeout: options.timeout,
    }).execute()
  }
}
