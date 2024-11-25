import type { ServiceGroupClient } from '../service-group-client/service-group-client.ts'
import { IsAlive } from './client-reporting/is-alive.ts'

export class ClientReporting {
  readonly isAlive: IsAlive

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('cr')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
  }
}
