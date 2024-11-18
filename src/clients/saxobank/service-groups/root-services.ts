import type { ServiceGroupClient } from '../service-group-client.ts'
import { IsAlive } from './root-services/is-alive.ts'

export class RootServices {
  readonly isAlive: IsAlive

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('root')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
  }
}
