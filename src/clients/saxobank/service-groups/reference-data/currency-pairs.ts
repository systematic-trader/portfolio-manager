import type { ServiceGroupClient } from '../../service-group-client.ts'
import { CurrencyPairDetails } from '../../types/records/currency-pair-details.ts'

export class CurrencyPairs {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/currencypairs')
  }

  async *get(
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<CurrencyPairDetails, void, undefined> {
    yield* this.#client.getPaginated({
      guard: CurrencyPairDetails,
      timeout: options.timeout,
    })
  }
}
