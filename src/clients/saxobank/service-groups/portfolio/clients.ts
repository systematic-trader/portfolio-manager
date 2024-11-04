import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { ClientResponse } from '../../types/records/client-response.ts'

export class Clients {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/clients')
  }

  /**
   * This endpoint will return information for all clients under the specified owner as well as the owner itself.
   */
  async *get({ OwnerKey }: {
    /**
     * Unique key identifying the owner.
     * This is the clientKey of the client under which the list of clients belongs.
     * Default: Logged-in user's client.
     */
    readonly OwnerKey?: undefined | string
  } = {}, options: { readonly timeout?: undefined | number } = {}): AsyncIterable<ClientResponse, void, undefined> {
    yield* this.#client.getPaginated({
      searchParams: {
        OwnerKey,
        $inlinecount: 'AllPages',
      },
      guard: ClientResponse,
      timeout: options.timeout,
    }).execute()
  }
}
