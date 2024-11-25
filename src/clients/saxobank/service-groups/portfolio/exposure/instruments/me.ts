import { array, optional } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../../../service-group-client/service-group-client.ts'
import { InstrumentExposureResponse } from '../../../../types/records/instrument-exposure-response.ts'

export class Me {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('me')
  }

  /** Returns a list instruments and net exposures. */
  async get(
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<ReadonlyArray<InstrumentExposureResponse>> {
    const exposure = await this.#client.get({
      guard: optional(array(InstrumentExposureResponse)),
      timeout: options.timeout,
    }).execute()

    return exposure ?? []
  }
}
