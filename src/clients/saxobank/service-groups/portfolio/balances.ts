import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { Me } from './balances/me.ts'

export class Balances {
  readonly me: Me

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('v1/balances')

    this.me = new Me({ client: serviceGroupClient })
  }
}
