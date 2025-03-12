import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { Ledger } from './account/ledger.ts'
import { Positions } from './account/positions.ts'
import { Summary } from './account/summary.ts'

export class Account {
  readonly #client: InteractiveBrokersResourceClient

  readonly ledger: Ledger
  readonly positions: Positions
  readonly summary: Summary

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client

    this.ledger = new Ledger(this.#client)
    this.positions = new Positions(this.#client)
    this.summary = new Summary(this.#client)
  }
}
