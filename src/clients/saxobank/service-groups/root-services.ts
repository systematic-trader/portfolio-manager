import type { ServiceGroupClient } from '../service-group-client.ts'
import { IsAlive } from './root-services/is-alive.ts'
import { Subscriptions } from './root-services/subscriptions.ts'

export class RootServices {
  readonly isAlive: IsAlive
  readonly subscriptions: Subscriptions

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('root')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
    this.subscriptions = new Subscriptions({ client: serviceGroupClient })
  }
}
