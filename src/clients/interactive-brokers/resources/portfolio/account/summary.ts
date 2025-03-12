import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'

export class Summary {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  /**
   * Portfolio account summary
   */
  async get({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    return await this.#client.get({
      path: `${this.#client.accountID}/summary`,
      searchParams: {
        waitForSecDef: true,
      },
      guard: undefined, // todo
      signal,
      timeout,
    })
  }
}
