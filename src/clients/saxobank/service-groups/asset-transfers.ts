import type { ServiceGroupClient } from '../service-group-client/service-group-client.ts'
import { IsAlive } from './asset-transfers/is-alive.ts'

export class AssetTransfers {
  readonly isAlive: IsAlive

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('atr')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
  }
}
