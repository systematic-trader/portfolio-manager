import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import type { ActiveUsersFilter } from '../../types/derives/active-users-filter.ts'
import { UserResponse } from '../../types/records/user-response.ts'

export class Users {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/users')
  }

  async *get(
    { ActiveUsersFilter, ClientKey, IncludeSubUsers }: undefined | {
      /**
       * Specifies that the response to the request should include a count of the number of entries in the collection.
       * Controls what users to be included in terms of active/inactive.
       * Default is all users.
       */
      readonly ActiveUsersFilter?: undefined | ActiveUsersFilter

      /**
       * Unique key identifying the owner.
       * This is the ClientKey of the client under which the list of users belongs.
       * Default: Logged-in user's client.
       */
      readonly ClientKey?: undefined | string

      /** Set to true if users of all underlying partners should be included in output. */
      readonly IncludeSubUsers?: undefined | boolean
    } = {},
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<UserResponse, void, undefined> {
    yield* this.#client.getPaginated({
      searchParams: {
        $inlinecount: 'AllPages',
        ActiveUsersFilter,
        ClientKey,
        IncludeSubUsers,
      },
      guard: UserResponse,
      timeout: options.timeout,
    }).execute()
  }
}
