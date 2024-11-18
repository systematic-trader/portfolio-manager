import type { ServiceGroupClient } from '../service-group-client.ts'
import { IsAlive } from './event-notification-services/is-alive.ts'

export class EventNotificationServices {
  readonly isAlive: IsAlive

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('ens')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
  }
}
