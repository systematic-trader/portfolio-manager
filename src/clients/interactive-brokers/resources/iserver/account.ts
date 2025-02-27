import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { Orders } from './account/orders.ts'
import { Summary } from './account/summary.ts'

export class Account {
  readonly #client: InteractiveBrokersResourceClient

  readonly summary: Summary
  readonly orders: Orders

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('account')

    this.summary = new Summary(this.#client)
    this.orders = new Orders(this.#client)
  }
}
