import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import type { ExchangeCode } from '../../../types/derived/exchange-code.ts'
import type { AssetClass } from '../../../types/record/asset-class.ts'

export class Schedule {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('schedule')
  }

  /**
   * Returns the trading schedule up to a month for the requested contract.
   */
  async get(parameters: {
    readonly assetClass: Extract<AssetClass, 'STK' | 'OPT' | 'FUT' | 'CFD' | 'WAR' | 'SWP' | 'FND' | 'BND' | 'ICS'>
    readonly symbol: string
    readonly exchange?: undefined | ExchangeCode
    readonly exchangeFilter?: undefined | readonly ExchangeCode[]
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    return await this.#client.get({
      searchParams: {
        ...parameters,
        exchangeFilter: parameters.exchangeFilter?.join(','),
      },
      guard: undefined, // todo write a guard for this
      signal,
      timeout,
    })
  }
}
