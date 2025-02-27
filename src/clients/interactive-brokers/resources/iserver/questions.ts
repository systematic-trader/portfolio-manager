import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { Suppress } from './questions/suppress.ts'

export class Questions {
  readonly #client: InteractiveBrokersResourceClient

  readonly suppress: Suppress

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('questions')

    this.suppress = new Suppress(this.#client)
  }
}
