import type { ArgumentType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { BalanceFieldGroupValues } from '../../types/derives/balance-field-group.ts'
import type { BalanceRequest } from '../../types/records/balance-request.ts'
import { BalanceResponse } from '../../types/records/balance-response.ts'
import { Subscriptions } from './balances/subscriptions.ts'

export class Balances {
  readonly #client: ServiceGroupClient

  readonly subscriptions: Subscriptions

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/balances')

    this.subscriptions = new Subscriptions({ client: this.#client })
  }

  /**
   * Get balance data for a client, account group or an account
   */
  async get(
    options: ArgumentType<BalanceRequest>,
    httpOptions: undefined | { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal } = {},
  ): Promise<BalanceResponse> {
    return await this.#client.get({
      searchParams: {
        ...options,
        FieldGroups: BalanceFieldGroupValues,
      },
      guard: BalanceResponse,
      timeout: httpOptions.timeout,
      signal: httpOptions.signal,
    }).execute()
  }
}
