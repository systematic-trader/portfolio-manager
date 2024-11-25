import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { ForwardTenor } from './standard-dates/forward-tenor.ts'
import { FxOptionExpiry } from './standard-dates/fx-option-expiry.ts'

export class StandardDates {
  readonly forwardTenor: ForwardTenor
  readonly fxOptionExpiry: FxOptionExpiry

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('v1/standarddates')

    this.forwardTenor = new ForwardTenor({ client: serviceGroupClient })
    this.fxOptionExpiry = new FxOptionExpiry({ client: serviceGroupClient })
  }
}
