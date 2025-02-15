import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { Pairs } from './currency/pairs.ts'

export class Currency {
  readonly #client: InteractiveBrokersResourceClient

  readonly pairs: Pairs

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('currency')

    this.pairs = new Pairs(this.#client)
  }
}
