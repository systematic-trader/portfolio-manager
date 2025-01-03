import type { ServiceGroupClient } from '../service-group-client/service-group-client.ts'
import { AccountGroups } from './portfolio/account-groups.ts'
import { Accounts } from './portfolio/accounts.ts'
import { Balances } from './portfolio/balances.ts'
import { Clients } from './portfolio/clients.ts'
import { Exposure } from './portfolio/exposure.ts'
import { IsAlive } from './portfolio/is-alive.ts'
import { Orders } from './portfolio/orders.ts'
import { Positions } from './portfolio/positions.ts'
import { Users } from './portfolio/users.ts'

export class Portfolio {
  readonly accountGroups: AccountGroups
  readonly accounts: Accounts
  readonly balances: Balances
  readonly clients: Clients
  readonly exposure: Exposure
  readonly isAlive: IsAlive
  readonly orders: Orders
  readonly positions: Positions
  readonly users: Users

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('port')

    this.accountGroups = new AccountGroups({ client: serviceGroupClient })
    this.accounts = new Accounts({ client: serviceGroupClient })
    this.balances = new Balances({ client: serviceGroupClient })
    this.clients = new Clients({ client: serviceGroupClient })
    this.exposure = new Exposure({ client: serviceGroupClient })
    this.isAlive = new IsAlive({ client: serviceGroupClient })
    this.orders = new Orders({ client: serviceGroupClient })
    this.positions = new Positions({ client: serviceGroupClient })
    this.users = new Users({ client: serviceGroupClient })
  }
}
