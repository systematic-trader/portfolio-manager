import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'

export class Allocation {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  /**
   * Get the given account's allocation.
   */
  async get({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    return await this.#client.get({
      path: `${this.#client.accountID}/allocation`,
      signal,
      timeout,
    })
  }
}
