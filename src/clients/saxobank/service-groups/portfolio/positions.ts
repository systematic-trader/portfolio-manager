import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { Me } from './positions/me.ts'

export class Positions {
  readonly me: Me

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('v1/positions')

    this.me = new Me({ client: serviceGroupClient })
  }
}
