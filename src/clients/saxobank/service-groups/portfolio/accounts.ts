import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { Account } from './accounts/account.ts'
import { Me } from './accounts/me.ts'

export class Accounts {
  readonly account: Account
  readonly me: Me

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('v1/accounts')

    this.account = new Account({ client: serviceGroupClient })
    this.me = new Me({ client: serviceGroupClient })
  }
}
