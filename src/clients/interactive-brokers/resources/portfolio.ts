import type { InteractiveBrokersResourceClient } from '../resource-client.ts'
import { Account } from './portfolio/account.ts'
import { Accounts } from './portfolio/accounts.ts'

export class Portfolio {
  readonly #client: InteractiveBrokersResourceClient

  readonly account: Account
  readonly accounts: Accounts

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('portfolio')

    this.account = new Account(this.#client)
    this.accounts = new Accounts(this.#client)
  }
}
