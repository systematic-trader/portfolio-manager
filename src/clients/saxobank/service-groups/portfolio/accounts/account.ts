import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import { Reset } from './account/reset.ts'

export class Account {
  readonly reset: Reset

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client

    this.reset = new Reset({ client: serviceGroupClient })
  }
}
