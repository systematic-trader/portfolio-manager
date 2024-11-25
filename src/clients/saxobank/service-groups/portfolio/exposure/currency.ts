import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import { Me } from './currency/me.ts'

export class Currency {
  readonly me: Me

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('currency')

    this.me = new Me({ client: serviceGroupClient })
  }
}
