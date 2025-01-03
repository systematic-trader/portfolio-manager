import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { InterAccountTransfers } from './cash-management/inter-account-transfers.ts'

export class CashManagement {
  readonly interAccountTransfers: InterAccountTransfers

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('v2/cashmanagement')

    this.interAccountTransfers = new InterAccountTransfers({ client: serviceGroupClient })
  }
}
