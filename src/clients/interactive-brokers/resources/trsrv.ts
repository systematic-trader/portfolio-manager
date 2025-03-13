import type { InteractiveBrokersResourceClient } from '../resource-client.ts'
import { AllConids } from './trsrv/all-conids.ts'
import { Futures } from './trsrv/futures.ts'
import { Secdef } from './trsrv/secdef.ts'

export class Trsrv {
  readonly #client: InteractiveBrokersResourceClient

  readonly allConids: AllConids
  readonly futures: Futures
  readonly secdef: Secdef

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('trsrv')

    this.allConids = new AllConids(this.#client)
    this.futures = new Futures(this.#client)
    this.secdef = new Secdef(this.#client)
  }
}
