import { InteractiveBrokersClient, type InteractiveBrokersClientOptions } from './client.ts'
import { InteractiveBrokersResourceClient } from './resource-client.ts'
import { Iserver } from './resources/iserver.ts'
import { Trsrv } from './resources/trsrv.ts'

export class InteractiveBrokersApplication implements AsyncDisposable {
  readonly #client: InteractiveBrokersClient

  readonly iserver: Iserver
  readonly trsrv: Trsrv

  constructor(options: InteractiveBrokersClientOptions) {
    this.#client = new InteractiveBrokersClient(options)

    const resourceClient = new InteractiveBrokersResourceClient({
      path: 'v1/api',
      http: this.#client,
    })

    this.iserver = new Iserver(resourceClient)
    this.trsrv = new Trsrv(resourceClient)
  }

  async [Symbol.asyncDispose](): Promise<void> {
    await this.#client.dispose()
  }

  dispose(): Promise<void> {
    return this[Symbol.asyncDispose]()
  }
}
