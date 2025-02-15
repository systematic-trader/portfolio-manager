import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { InfoAndRules } from './contract/info-and-rules.ts'

export class Contract {
  readonly #client: InteractiveBrokersResourceClient

  readonly infoAndRules: InfoAndRules

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('contract')

    this.infoAndRules = new InfoAndRules(this.#client)
  }
}
