import { boolean, props } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { Snapshot } from './marketdata/snapshot.ts'

const UnsubscribeAllResponse = props({
  unsubscribed: boolean(),
})
export class MarketData {
  readonly #client: InteractiveBrokersResourceClient

  readonly snapshot: Snapshot

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('marketdata')

    this.snapshot = new Snapshot(this.#client)
  }

  async unsubscribeAll({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<boolean> {
    const response = await this.#client.get({
      path: 'unsubscribeall',
      guard: UnsubscribeAllResponse,
      signal,
      timeout,
    })

    return response.unsubscribed
  }
}
