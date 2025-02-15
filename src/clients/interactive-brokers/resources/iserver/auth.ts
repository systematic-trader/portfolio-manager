import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { Status } from './auth/status.ts'

export class Auth {
  readonly #client: InteractiveBrokersResourceClient

  readonly status: Status

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('auth')

    this.status = new Status(this.#client)
  }
}
