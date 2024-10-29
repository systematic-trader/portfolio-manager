import type { ServiceGroupClient } from '../../service-group-client.ts'
import { LanguageDetails } from '../../types/records/language-details.ts'

export class Languages {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/languages')
  }

  async *get(
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<LanguageDetails, void, undefined> {
    yield* this.#client.getPaginated({
      guard: LanguageDetails,
      timeout: options.timeout,
    })
  }
}
