import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { Summary } from './account/summary.ts'

export class Account {
  readonly #client: InteractiveBrokersResourceClient

  readonly summary: Summary

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('account')

    this.summary = new Summary(this.#client)
  }
}
