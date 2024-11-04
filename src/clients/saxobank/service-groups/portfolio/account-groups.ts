import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { AccountGroupResponse } from '../../types/records/account-group-response.ts'

export class AccountGroups {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/accountgroups')
  }

  /**
   * Get a list of all account groups used by the specified client
   */
  async *get(
    { ClientKey }: {
      /** The client to which the account groups belong. */
      readonly ClientKey: string
    },
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<AccountGroupResponse, void, undefined> {
    yield* this.#client.getPaginated({
      searchParams: {
        $inlinecount: 'AllPages',
        ClientKey,
      },
      guard: AccountGroupResponse,
      timeout: options.timeout,
    }).execute()
  }
}
