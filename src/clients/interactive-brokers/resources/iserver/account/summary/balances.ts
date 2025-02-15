import type { InteractiveBrokersResourceClient } from '../../../../resource-client.ts'

export class Balances {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  async get({ accountId }: {
    readonly accountId: string
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    return await this.#client.get({
      path: `${accountId}/summary/balances`,
      guard: undefined, // todo write guard
      signal,
      timeout,
    })
  }
}
