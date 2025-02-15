import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { Info } from './secdef/info.ts'
import { Search } from './secdef/search.ts'

export class Secdef {
  readonly #client: InteractiveBrokersResourceClient

  readonly info: Info
  readonly search: Search

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('secdef')

    this.info = new Info(this.#client)
    this.search = new Search(this.#client)
  }
}
