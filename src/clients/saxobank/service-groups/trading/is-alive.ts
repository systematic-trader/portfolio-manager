import { string } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../service-group-client.ts'

const IsAliveGuard = string({
  pattern: /The Open API Service Group \(Iit\.OpenApi\.Services\.Trading \d+\.\d+\.\d+\+[a-f0-9]+\) is Running!/,
})

export class IsAlive {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('isalive')
  }

  async get(
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<string> {
    return await this.#client.getText({
      guard: IsAliveGuard,
      timeout: options.timeout,
    })
  }
}
