import type { ServiceGroupClient } from '../service-group-client.ts'
import { IsAlive } from './partner-integration/is-alive.ts'

export class PartnerIntegration {
  readonly isAlive: IsAlive

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('partnerintegration')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
  }
}
