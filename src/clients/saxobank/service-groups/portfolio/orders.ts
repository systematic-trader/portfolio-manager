import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { Me } from './orders/me.ts'

export class Orders {
  readonly me: Me

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('v1/orders')

    this.me = new Me({ client: serviceGroupClient })
  }
}
