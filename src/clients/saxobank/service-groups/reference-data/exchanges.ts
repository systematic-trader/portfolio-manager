import type { ServiceGroupClient } from '../../service-group-client.ts'
import { ExchangeDetails } from '../../types/records/exchange-details.ts'

export class Exchanges {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/exchanges')
  }

  async *get(
    { exchangeId }: { exchangeId?: undefined | string } = {},
  ): AsyncGenerator<ExchangeDetails, void, undefined> {
    if (exchangeId === undefined) {
      yield* this.#client.getPaginated({ guard: ExchangeDetails })
    }

    yield this.#client.get({ guard: ExchangeDetails, path: exchangeId })
  }
}
