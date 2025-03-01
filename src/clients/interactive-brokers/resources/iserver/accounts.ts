import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { AccountsResponse } from '../../types/record/accounts-response.ts'

export class Accounts {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('accounts')
  }

  async get({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<AccountsResponse> {
    return await this.#client.get({
      guard: AccountsResponse,
      signal,
      timeout,
    })
  }
}
