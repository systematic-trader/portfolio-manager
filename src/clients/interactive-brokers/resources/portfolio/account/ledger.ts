import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import { LedgerResponse } from '../../../types/record/ledger-response.ts'

export class Ledger {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  /**
   * Get the given account's ledger data detailing its balances by currency.
   */
  async get({ accountId }: {
    readonly accountId: string
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<LedgerResponse> {
    return await this.#client.get({
      path: `${accountId}/ledger`,
      guard: LedgerResponse,
      signal,
      timeout,
    })
  }
}
