import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { Accounts as AccountsType } from '../../types/record/accounts.ts'

export class Accounts {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('accounts')
  }

  async get({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<AccountsType> {
    return await this.#client.get({
      guard: AccountsType,
      signal,
      timeout,
    })
  }
}
