import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import { Invalidate } from './positions/invalidate.ts'

export class Positions {
  readonly #client: InteractiveBrokersResourceClient

  readonly invalidate: Invalidate

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client

    this.invalidate = new Invalidate(this.#client)
  }

  /**
   * Get all positions in an account.
   */
  async get({ accountId, pageId }: {
    readonly accountId: string
    readonly pageId?: undefined | number
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    return await this.#client.get({
      path: `${accountId}/positions/${pageId}`,
      guard: undefined, // todo write a guard
      signal,
      timeout,
    })
  }
}
