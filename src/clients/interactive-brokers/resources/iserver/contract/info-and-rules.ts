import { assertReturn, props, string } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import { AssetClass } from '../../../types/record/asset-class.ts'
import { ContractInfo, type ContractInfoUnion } from '../../../types/record/contract-info.ts'

export class InfoAndRules {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  /**
   * Requests full contract details for the given conid
   */
  async get({ conid }: {
    readonly conid: number | string
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<ContractInfoUnion> {
    const response = await this.#client.get({
      path: `${conid}/info-and-rules`,
      guard: props({
        instrument_type: AssetClass,
        valid_exchanges: string(),
      }, { extendable: true }),
      signal,
      timeout,
    })

    // Ideally we wouldn't have to transform any properties from the response
    // But given that we want to know the valid exchanges, we have to map them (so we can update our guard)
    const mappedValidExchanges = response.valid_exchanges.split(',')
    const mappedResponse = { ...response, 'valid_exchanges': mappedValidExchanges }

    switch (response.instrument_type) {
      case 'STK': {
        return assertReturn(ContractInfo.STK, mappedResponse)
      }

      default:
        return assertReturn(ContractInfo.Unknown, mappedResponse)
    }
  }
}
