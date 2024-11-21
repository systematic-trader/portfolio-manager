import type { ServiceGroupClient } from '../../../service-group-client.ts'
import { AccountResponse } from '../../../types/records/account-response.ts'

export class Me {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('me')
  }

  /** Returns all accounts under a particular client to which the logged in user belongs. */
  async *get(
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<AccountResponse, void, undefined> {
    yield* this.#client.getPaginated({
      searchParams: {
        $inlinecount: 'AllPages',
      },
      guard: AccountResponse,
      timeout: options.timeout,
    }).execute()
  }
}
