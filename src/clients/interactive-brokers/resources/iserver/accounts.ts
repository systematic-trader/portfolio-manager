import { assertReturn } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Timeout } from '../../../../utils/timeout.ts'
import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import { AccountsResponse } from '../../types/record/accounts-response.ts'

export class Accounts {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('accounts')
  }

  async get({ signal, timeout, delay = 1000 }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
    readonly delay?: undefined | number
  } = {}): Promise<AccountsResponse> {
    while (true) {
      const response = await this.#client.get({
        signal,
        timeout,
      })

      // If the response is not an empty object, the endpoint must be "warm"
      if (typeof response === 'object' && response !== null && 'accounts' in response) {
        return assertReturn(AccountsResponse, response)
      }

      // Otherwise, we should wait a bit and try again
      await Timeout.wait(delay)
    }
  }
}
