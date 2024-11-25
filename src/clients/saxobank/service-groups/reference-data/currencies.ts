import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { CurrencyDetails } from '../../types/records/currency-details.ts'

const DEPRECATED = new Set(['BGN', 'CYP', 'MTL'])

export class Currencies {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/currencies')
  }

  async *get(
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<CurrencyDetails, void, undefined> {
    const currencies = this.#client.getPaginated({
      guard: CurrencyDetails,
      timeout: options.timeout,
    }).execute()

    for await (const currency of currencies) {
      if (DEPRECATED.has(currency.CurrencyCode) === false) {
        yield currency
      }
    }
  }
}
