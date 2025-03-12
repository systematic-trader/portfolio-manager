import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import { Ledger as LedgerResponse } from '../../../types/record/ledger.ts'

export class Ledger {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  /**
   * Get the given account's ledger data detailing its balances by currency.
   */
  async get({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<LedgerResponse> {
    return await this.#client.get({
      path: `${this.#client.accountID}/ledger`,
      guard: LedgerResponse,
      signal,
      timeout,
    })
  }
}
