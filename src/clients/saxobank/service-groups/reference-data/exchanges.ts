import type { ServiceGroupClient } from '../../service-group-client.ts'
import { ExchangeDetails } from '../../types/derives/exchange-details.ts'

export class Exchanges {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/exchanges')
  }

  async *get(
    { exchangeId }: { exchangeId?: undefined | string } = {},
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncGenerator<ExchangeDetails, void, undefined> {
    if (exchangeId === undefined) {
      return yield* this.#client.getPaginated({
        guard: ExchangeDetails,
        timeout: options.timeout,
      }).execute()
    }

    yield this.#client.get({
      guard: ExchangeDetails,
      path: exchangeId,
      timeout: options.timeout,
    }).execute()
  }
}
