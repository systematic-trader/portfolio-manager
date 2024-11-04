import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { AccountResponse } from '../../types/records/account-response.ts'
import { Account } from './accounts/account.ts'

export class Accounts {
  readonly #client: ServiceGroupClient
  readonly account: Account

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/accounts')

    this.account = new Account({ client: this.#client })
  }

  async *get(
    {
      ClientKey,
      IncludeSubAccounts,
    }: {
      /**
       * The client to which the accounts belong.
       * Default: Logged-in user's client.
       */
      readonly ClientKey?: undefined | string

      /** Optionally set true to request that all sub accounts are returned. */
      IncludeSubAccounts?: undefined | boolean
    } = {},
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<AccountResponse, void, undefined> {
    yield* this.#client.getPaginated({
      searchParams: {
        $inlinecount: 'AllPages',
        ClientKey,
        IncludeSubAccounts,
      },
      guard: AccountResponse,
      timeout: options.timeout,
    }).execute()
  }
}
