import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import type { Currency3 } from '../../../types/derived/currency.ts'
import { CurrencyPairsResponse } from '../../../types/record/currency-pairs-response.ts'

export class Pairs {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('pairs')
  }

  /**
   * Obtains available currency pairs corresponding to the given target currency
   */
  async get<C extends Currency3>({ currency }: {
    readonly currency: readonly C[]
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<{ readonly [currency in C]: CurrencyPairsResponse[C] }> {
    return await this.#client.get({
      searchParams: {
        currency: currency.join(','),
      },
      guard: CurrencyPairsResponse,
      signal,
      timeout,
    })
  }
}
