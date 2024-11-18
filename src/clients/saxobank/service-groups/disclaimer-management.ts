import type { ServiceGroupClient } from '../service-group-client.ts'
import { IsAlive } from './disclaimer-management/is-alive.ts'

export class DisclaimerManagement {
  readonly isAlive: IsAlive

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('dm')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
  }
}
