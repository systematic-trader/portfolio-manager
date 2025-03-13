import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { InfoAndRules } from './contract/info-and-rules.ts'
import { Info } from './contract/info.ts'
import { Rules } from './contract/rules.ts'

export class Contract {
  readonly #client: InteractiveBrokersResourceClient

  readonly info: Info
  readonly infoAndRules: InfoAndRules
  readonly rules: Rules

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('contract')

    this.infoAndRules = new InfoAndRules(this.#client)
    this.info = new Info(this.#client)
    this.rules = new Rules(this.#client)
  }
}
