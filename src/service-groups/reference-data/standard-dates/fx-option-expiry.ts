import { HTTPClientError } from '../../../clients/http-client.ts'
import type { ServiceGroupClient } from '../../../service-group-client.ts'
import { StandardDate } from '../../../types/records/standard-date.ts'

export class FxOptionExpiry {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('fxoptionexpiry')
  }

  async get({ Uic }: { readonly Uic: number | string }): Promise<ReadonlyArray<StandardDate>> {
    try {
      return await this.#client.getPaginated({
        path: `${Uic}`,
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
