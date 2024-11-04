import { array, optional } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import { InstrumentExposureResponse } from '../../../types/records/instrument-exposure-response.ts'

export class Instruments {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('instruments')
  }

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
  ): AsyncIterable<InstrumentExposureResponse, void, undefined> {
    const response = await this.#client.get({
      searchParams: {
        AccountGroupKey,
        AccountKey,
        ClientKey,
      },
      guard: optional(array(InstrumentExposureResponse)),
      timeout: options.timeout,
    }).execute()

    if (response !== undefined) {
      yield* response
    }
  }
}
