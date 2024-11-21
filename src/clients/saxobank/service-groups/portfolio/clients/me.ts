import type { ServiceGroupClient } from '../../../service-group-client.ts'
import { ClientResponse } from '../../../types/records/client-response.ts'

export class Me {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('me')
  }

  /** Get details about logged-in user's client */
  async get(
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<ClientResponse> {
    return await this.#client.get({
      searchParams: {
        $inlinecount: 'AllPages',
      },
      guard: ClientResponse,
      timeout: options.timeout,
    }).execute()
  }
}
