import type { ServiceGroupClient } from '../../service-group-client.ts'
import { Strategy } from '../../types/records/strategy.ts'

export class AlgoStrategies {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/algostrategies')
  }

  async *get(
    { name }: { name?: undefined | string } = {},
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<Strategy> {
    if (name === undefined) {
      return yield* this.#client.getPaginated({
        guard: Strategy,
        timeout: options.timeout,
      })
    }

    yield this.#client.get({
      guard: Strategy,
      path: name,
      timeout: options.timeout,
    })
  }
}
