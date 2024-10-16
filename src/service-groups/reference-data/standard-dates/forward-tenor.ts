import { HTTPClientError } from '../../../http-client.ts'
import type { ServiceGroupClient } from '../../../service-group-client.ts'
import { StandardDate } from '../../../types/records/standard-date.ts'

export class ForwardTenor {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('forwardtenor')
  }

  async get(
    { Uic, AccountKey }: { readonly Uic: number | string; readonly AccountKey: string },
  ): Promise<ReadonlyArray<StandardDate>> {
    try {
      return await this.#client.getPaginated({
        path: String(Uic),
        searchParams: { AccountKey: String(AccountKey) },
        guard: StandardDate,
      })
    } catch (error) {
      if (error instanceof HTTPClientError && error.statusCode === 404) {
        return []
      }

      throw error
    }
  }
}
