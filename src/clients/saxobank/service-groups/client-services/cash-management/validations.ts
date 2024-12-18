import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import { AccountBalances } from './validations/account-balances.ts'

export class Validations {
  readonly accountBalances: AccountBalances

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('validations')

    this.accountBalances = new AccountBalances({ client: serviceGroupClient })
  }
}
