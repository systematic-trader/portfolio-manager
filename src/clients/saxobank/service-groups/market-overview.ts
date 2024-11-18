import type { ServiceGroupClient } from '../service-group-client.ts'
import { IsAlive } from './market-overview/is-alive.ts'

export class MarketOverview {
  readonly isAlive: IsAlive

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('mkt')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
  }
}
