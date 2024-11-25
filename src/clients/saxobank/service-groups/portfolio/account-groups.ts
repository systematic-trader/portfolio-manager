import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { AccountGroup } from './account-groups/account-group.ts'
import { Me } from './account-groups/me.ts'

export class AccountGroups {
  readonly me: Me
  readonly accountGroup: AccountGroup

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('v1/accountgroups')

    this.me = new Me({ client: serviceGroupClient })
    this.accountGroup = new AccountGroup({ client: serviceGroupClient })
  }
}
