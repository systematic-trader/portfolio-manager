import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { Order } from './account/order.ts'
import { Orders } from './account/orders.ts'
import { Summary } from './account/summary.ts'

export class Account {
  readonly #client: InteractiveBrokersResourceClient

  readonly order: Order
  readonly orders: Orders
  readonly summary: Summary

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('account')

    this.order = new Order(this.#client)
    this.orders = new Orders(this.#client)
    this.summary = new Summary(this.#client)
  }
}
