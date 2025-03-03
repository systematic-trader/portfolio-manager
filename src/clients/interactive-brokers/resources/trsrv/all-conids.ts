import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import type { AssetClass } from '../../types/derived/asset-class.ts'
import type { ExchangeCode } from '../../types/derived/exchange-code.ts'
import { AllConidsResponse } from '../../types/record/all-conids-response.ts'

export class AllConids {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('all-conids')
  }

  /**
   * Send out a request to retrieve all contracts made available on a requested exchange.
   * This returns all contracts that are tradable on the exchange, even those that are not using the exchange as their primary listing.
   */
  async get({ exchange, assetClass }: {
    readonly exchange: ExchangeCode
    readonly assetClass: AssetClass
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<AllConidsResponse> {
    return await this.#client.get({
      searchParams: {
        exchange,
        assetClass,
      },
      guard: AllConidsResponse,
      signal,
      timeout,
    })
  }
}
