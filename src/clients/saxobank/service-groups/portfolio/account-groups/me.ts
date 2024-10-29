import type { ServiceGroupClient } from '../../../service-group-client.ts'
import { AccountGroupResponse } from '../../../types/records/account-group-response.ts'

export class Me {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('me')
  }

  /** Get all accounts gropus under a particular client to which the logged in user belongs. */
  async *get(
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<AccountGroupResponse, void, undefined> {
    yield* this.#client.getPaginated({
      searchParams: {
        $inlinecount: 'AllPages',
      },
      guard: AccountGroupResponse,
      timeout: options.timeout,
    })
  }
}
