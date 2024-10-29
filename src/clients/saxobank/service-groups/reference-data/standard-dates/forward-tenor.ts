import { HTTPClientError } from '../../../../http-client.ts'
import type { ServiceGroupClient } from '../../../service-group-client.ts'
import { StandardDate } from '../../../types/records/standard-date.ts'

export class ForwardTenor {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('forwardtenor')
  }

  async *get(
    { Uic, AccountKey }: {
      readonly Uic: number | string
      readonly AccountKey?: undefined | string
    },
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<StandardDate, void, undefined> {
    try {
      yield* this.#client.getPaginated({
        path: String(Uic),
        searchParams: {
          AccountKey: AccountKey === undefined ? undefined : String(AccountKey),
        },
        guard: StandardDate,
        timeout: options.timeout,
      })
    } catch (error) {
      if (error instanceof HTTPClientError && error.statusCode === 404) {
        return
      }

      throw error
    }
  }
}
