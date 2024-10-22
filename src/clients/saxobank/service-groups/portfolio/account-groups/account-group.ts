import type { ServiceGroupClient } from '../../../service-group-client.ts'
import { AccountGroupResponse } from '../../../types/records/account-group-response.ts'

// todo not tested (we have no account groups in simulation env)
export class AccountGroup {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client
  }

  /** Get details about a single account group */
  async *get({ AccountGroupKey, ClientKey }: {
    readonly AccountGroupKey: string
    readonly ClientKey: string
  }): AsyncIterable<AccountGroupResponse, void, undefined> {
    yield* this.#client.getPaginated({
      path: AccountGroupKey,
      searchParams: {
        ClientKey,
      },
      guard: AccountGroupResponse,
    })
  }
}
