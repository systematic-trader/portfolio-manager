import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { Me } from './clients/me.ts'

export class Clients {
  readonly me: Me

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('v1/clients')

    this.me = new Me({ client: serviceGroupClient })
  }
}
