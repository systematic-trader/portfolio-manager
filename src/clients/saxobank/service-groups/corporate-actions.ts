import type { ServiceGroupClient } from '../service-group-client/service-group-client.ts'
import { IsAlive } from './corporate-actions/is-alive.ts'

export class CorporateActions {
  readonly isAlive: IsAlive

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('ca')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
  }
}
