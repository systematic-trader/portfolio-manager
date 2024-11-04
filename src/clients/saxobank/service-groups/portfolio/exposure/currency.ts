import { array, optional } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import { CurrencyExposuresResponse } from '../../../types/records/currency-exposures-response.ts'

export class Currency {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('currency')
  }

  /** Returns a list of currencies in which there is an exposure. */
  async *get(
    {
      AccountGroupKey,
      AccountKey,
      ClientKey,
    }: {
      /** The key of the account group to which the positions belong. */
      readonly AccountGroupKey?: undefined | string

      /** The key of the account to which the positions belong. */
      readonly AccountKey?: undefined | string

      /** The key of the client to which the positions belong. */
      readonly ClientKey: string
    },
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<CurrencyExposuresResponse, void, undefined> {
    const response = await this.#client.get({
      searchParams: {
        AccountGroupKey,
        AccountKey,
        ClientKey,
      },
      guard: optional(array(CurrencyExposuresResponse)),
      timeout: options.timeout,
    }).execute()

    if (response !== undefined) {
      yield* response
    }
  }
}
