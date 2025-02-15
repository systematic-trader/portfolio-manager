import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import type { Currency3 } from '../../types/derived/currency.ts'
import { ExchangeRateResponse } from '../../types/record/exchange-rate-response.ts'

export class ExchangeRate {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('exchangerate')
  }

  /**
   * Obtains the exchange rates of the currency pair
   */
  async get(parameters: {
    readonly source: Currency3
    readonly target: Currency3
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<ExchangeRateResponse> {
    return await this.#client.get({
      searchParams: parameters,
      guard: ExchangeRateResponse,
      signal,
      timeout,
    })
  }
}
