import { array, props, string } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { HTTPClientError } from '../../../../http-client.ts'
import type { ServiceGroupClient } from '../../../service-group-client.ts'
import { FuturesSpaceElement } from '../../../types/records/futures-space-element.ts'

const ResponseBodyGuard = props({
  /** The base id of the futures space. */
  BaseIdentifier: string(),
  /** The elements of the futures space. */
  Elements: array(FuturesSpaceElement),
})

export class ContractFuturesSpaces {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('futuresspaces')
  }

  async get(
    { Uic }: { readonly Uic: number },
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<ReadonlyArray<FuturesSpaceElement>> {
    try {
      const responseBody = await this.#client.get({
        path: String(Uic),
        guard: ResponseBodyGuard,
        timeout: options.timeout,
      })

      return responseBody.Elements
    } catch (error) {
      if (error instanceof HTTPClientError && error.statusCode === 404) {
        return []
      }

      throw error
    }
  }
}
