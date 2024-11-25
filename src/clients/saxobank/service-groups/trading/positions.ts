import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'

export class Positions {
  constructor({ client }: { readonly client: ServiceGroupClient }) {
    client.appendPath('v1/positions')
  }
}
