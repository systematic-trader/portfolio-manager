import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { Me } from './users/me.ts'

export class Users {
  readonly me: Me

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('v1/users')

    this.me = new Me({ client: serviceGroupClient })
  }
}
