import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'

export class Accounts {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('accounts')
  }

  /**
   * Return accounts
   */
  async get({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    return await this.#client.get({
      guard: undefined, // todo write guard
      signal,
      timeout,
    })
  }
}
