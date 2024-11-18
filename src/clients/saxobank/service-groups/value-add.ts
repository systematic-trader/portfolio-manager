import type { ServiceGroupClient } from '../service-group-client.ts'
import { IsAlive } from './value-add/is-alive.ts'

export class ValueAdd {
  readonly isAlive: IsAlive

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('vas')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
  }
}
