import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { Me } from './net-positions/me.ts'

export class NetPositions {
  readonly me: Me

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('v1/netpositions')

    this.me = new Me({ client: serviceGroupClient })
  }
}
