import type { ServiceGroupClient } from '../../../service-group-client.ts'
import { BalanceResponse } from '../../../types/records/balance-response.ts'

export class Me {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('me')
  }

  /** Get balance data for logged-in client. */
  async get(
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<BalanceResponse> {
    return await this.#client.get({
      searchParams: {
        $inlinecount: 'AllPages',
      },
      guard: BalanceResponse,
      timeout: options.timeout,
    }).execute()
  }
}
