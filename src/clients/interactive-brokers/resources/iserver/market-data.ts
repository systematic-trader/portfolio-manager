import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { Snapshot } from './marketdata/snapshot.ts'

export class MarketData {
  readonly #client: InteractiveBrokersResourceClient

  readonly snapshot: Snapshot

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('marketdata')

    this.snapshot = new Snapshot(this.#client)
  }
}
