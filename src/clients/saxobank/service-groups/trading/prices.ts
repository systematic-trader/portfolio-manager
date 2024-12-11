import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { Subscriptions } from './prices/subscriptions.ts'

export class Prices {
  readonly #client: ServiceGroupClient

  readonly subscriptions: Subscriptions

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/prices')

    this.subscriptions = new Subscriptions({ client: this.#client })
  }
}
