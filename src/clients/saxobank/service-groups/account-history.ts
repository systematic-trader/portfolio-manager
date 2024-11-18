import type { ServiceGroupClient } from '../service-group-client.ts'
import { IsAlive } from './account-history/is-alive.ts'

export class AccountHistory {
  readonly isAlive: IsAlive

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('hist')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
  }
}
