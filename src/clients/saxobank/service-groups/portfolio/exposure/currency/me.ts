import { array, optional } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../../../service-group-client.ts'
import { CurrencyExposuresResponse } from '../../../../types/records/currency-exposures-response.ts'

export class Me {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('me')
  }

  /** Returns a list of currencies and net exposures. */
  async get(
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<ReadonlyArray<CurrencyExposuresResponse>> {
    const exposure = await this.#client.get({
      guard: optional(array(CurrencyExposuresResponse)),
      timeout: options.timeout,
    })

    return exposure ?? []
  }
}
