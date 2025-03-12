import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import { AvailableFunds } from './summary/available-funds.ts'
import { Balances } from './summary/balances.ts'
import { Margins } from './summary/margins.ts'
import { MarketValue } from './summary/market-value.ts'

export class Summary {
  readonly #client: InteractiveBrokersResourceClient

  readonly availableFunds: AvailableFunds
  readonly balances: Balances
  readonly margins: Margins
  readonly marketValue: MarketValue

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client

    this.availableFunds = new AvailableFunds(client)
    this.balances = new Balances(client)
    this.margins = new Margins(client)
    this.marketValue = new MarketValue(client)
  }

  /**
   * Provides a general overview of the account details such as balance values
   */
  async get({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    return await this.#client.get({
      path: `${this.#client.accountID}/summary`,
      guard: undefined, // todo write guard
      signal,
      timeout,
    })
  }
}
