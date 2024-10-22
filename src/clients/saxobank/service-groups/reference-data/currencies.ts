import type { ServiceGroupClient } from '../../service-group-client.ts'
import { CurrencyDetails } from '../../types/records/currency-details.ts'

const DEPRECATED = new Set(['BGN', 'CYP', 'MTL'])

export class Currencies {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/currencies')
  }

  async *get(): AsyncIterable<CurrencyDetails, void, undefined> {
    for await (const currency of this.#client.getPaginated({ guard: CurrencyDetails })) {
      if (DEPRECATED.has(currency.CurrencyCode) === false) {
        yield currency
      }
    }
  }
}
