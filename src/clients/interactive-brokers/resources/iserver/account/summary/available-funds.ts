import type { InteractiveBrokersResourceClient } from '../../../../resource-client.ts'

export class AvailableFunds {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  /**
   * Provides a summary specific for available funds giving more depth than the standard /summary endpoint.
   */
  async get({ accountId }: {
    readonly accountId: string
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    return await this.#client.get({
      path: `${accountId}/summary/available_funds`,
      guard: undefined, // todo write guard
      signal,
      timeout,
    })
  }
}
