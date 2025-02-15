import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'

export class Status {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('status')
  }

  async post({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    return await this.#client.post({
      guard: undefined, // todo i wrote BrokerageSessionStatus, but it seems to be breaking
      signal,
      timeout,
    })
  }
}
