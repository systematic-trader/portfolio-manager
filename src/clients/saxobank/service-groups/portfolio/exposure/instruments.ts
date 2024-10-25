import type { ServiceGroupClient } from '../../../service-group-client.ts'
import { Me } from './instruments/me.ts'

export class Instruments {
  readonly me: Me

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('instruments')

    this.me = new Me({ client: serviceGroupClient })
  }
}
