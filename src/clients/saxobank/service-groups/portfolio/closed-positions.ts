import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { Me } from './closed-positions/me.ts'

export class ClosedPositions {
  readonly me: Me

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('v1/closedpositions')

    this.me = new Me({ client: serviceGroupClient })
  }
}
