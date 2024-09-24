import type { ResourceClient } from '../../resource-client.ts'
import { CurrencyDetails } from '../../types/records/currency-details.ts'

const DEPRECATED = new Set(['BGN', 'CYP', 'MTL'])

export class Currencies {
  readonly #client: ResourceClient

  constructor({ client }: { readonly client: ResourceClient }) {
    this.#client = client.appendPath('v1/currencies')
  }

  async get(): Promise<ReadonlyArray<CurrencyDetails>> {
    const currencies = await this.#client.getPaginated({ guard: CurrencyDetails })

    return currencies.filter(
      (currency) => DEPRECATED.has(currency.CurrencyCode) === false,
    )
  }
}