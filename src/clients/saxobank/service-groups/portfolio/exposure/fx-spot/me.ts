import { array } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../../../service-group-client/service-group-client.ts'
import { CurrencyExposuresResponse } from '../../../../types/records/currency-exposures-response.ts'

export class Me {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('me')
  }

  /** Returns a list of currency exposures from FxSpot positions for the client, to which the logged in user belongs. */
  async get(
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<ReadonlyArray<CurrencyExposuresResponse>> {
    return await this.#client.get({
      guard: array(CurrencyExposuresResponse),
      timeout: options.timeout,
    }).execute()
  }
}
