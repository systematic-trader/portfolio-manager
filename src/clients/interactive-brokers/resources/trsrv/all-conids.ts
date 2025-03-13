import {
  array,
  type GuardType,
  integer,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import type { AssetClass } from '../../types/derived/asset-class.ts'
import { ExchangeCode } from '../../types/derived/exchange-code.ts'

export const AllConidsResponse = array(props({
  ticker: string(),
  conid: integer(),
  exchange: ExchangeCode,
}))

export type AllConidsResponse = GuardType<typeof AllConidsResponse>

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
    const result = await this.#client.get({
      searchParams: {
        exchange,
        assetClass,
      },
      guard: optional(AllConidsResponse),
      signal,
      timeout,
    })

    if (result === undefined) {
      return []
    }

    return result
  }
}
