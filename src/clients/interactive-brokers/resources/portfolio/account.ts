import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { Ledger } from './account/ledger.ts'
import { Positions } from './account/positions.ts'

export class Account {
  readonly #client: InteractiveBrokersResourceClient

  readonly positions: Positions
  readonly ledger: Ledger

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client

    this.positions = new Positions(this.#client)
    this.ledger = new Ledger(this.#client)
  }
}
