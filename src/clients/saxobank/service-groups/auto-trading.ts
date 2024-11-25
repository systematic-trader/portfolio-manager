import type { ServiceGroupClient } from '../service-group-client/service-group-client.ts'
import { IsAlive } from './auto-trading/is-alive.ts'

export class AutoTrading {
  readonly isAlive: IsAlive

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('at')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
  }
}
