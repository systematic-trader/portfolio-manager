import type { ServiceGroupClient } from '../../service-group-client.ts'
import { Strategy } from '../../types/records/strategy.ts'

export class AlgoStrategies {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/algostrategies')
  }

  async *get({ name }: { name?: undefined | string } = {}): AsyncIterable<Strategy> {
    if (name === undefined) {
      return yield* this.#client.getPaginated({ guard: Strategy })
    }

    yield this.#client.get({ guard: Strategy, path: name })
  }
}
