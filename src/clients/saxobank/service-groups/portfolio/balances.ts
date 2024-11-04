import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import type { BalanceFieldGroup } from '../../types/derives/balance-field-group.ts'
import { BalanceResponse } from '../../types/records/balance-response.ts'

const FieldGroups: readonly BalanceFieldGroup[] = [
  'CalculateCashForTrading',
  'MarginOverview',
]

export class Balances {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/balances')
  }

  /**
   * Get balance data for a client, account group or an account
   */
  async get(
    { AccountGroupKey, AccountKey, ClientKey }: {
      /** The key of the account group for which the balance data is returned */
      readonly AccountGroupKey?: undefined | string

      /** The key of the account for which the balance data is returned */
      readonly AccountKey?: undefined | string

      /** The key of the client for which the balance data is returned */
      readonly ClientKey: string
    },
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<BalanceResponse> {
    return await this.#client.get({
      searchParams: {
        AccountGroupKey,
        AccountKey,
        ClientKey,
        FieldGroups,
      },
      guard: BalanceResponse,
      timeout: options.timeout,
    }).execute()
  }
}
