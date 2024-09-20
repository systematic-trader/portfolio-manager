import { array } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ResourceClient } from '../../../../resource-client.ts'
import { CurrencyExposuresResponse } from '../../../../types/records/currency-exposures-response.ts'

export class Me {
  readonly #client: ResourceClient

  constructor({ client }: { readonly client: ResourceClient }) {
    this.#client = client.appendPath('me')
  }

  /** Returns a list of currency exposures from FxSpot positions for the client, to which the logged in user belongs. */
  async get(): Promise<ReadonlyArray<CurrencyExposuresResponse>> {
    return await this.#client.get({
      guard: array(CurrencyExposuresResponse),
    })
  }
}
