import type { ServiceGroupClient } from '../service-group-client.ts'
import { IsAlive } from './client-management/is-alive.ts'

export class ClientManagement {
  readonly isAlive: IsAlive

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('cm')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
  }
}
