import { optional } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import { Positions as PositionsResponse } from '../../../types/record/positions.ts'
import { Invalidate } from './positions/invalidate.ts'

type Writable<T> = { -readonly [K in keyof T]: T[K] }

export class Positions {
  readonly #client: InteractiveBrokersResourceClient

  readonly invalidate: Invalidate

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client

    this.invalidate = new Invalidate(this.#client)
  }

  /**
   * Get all positions in an account.
   */
  async get({ accountId }: {
    /** Account ID whose positions are requested. */
    readonly accountId: string
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<PositionsResponse> {
    const records: Writable<PositionsResponse> = []

    let pageIndex = 0

    while (true) {
      const page = await this.#client.get({
        path: `${accountId}/positions/${pageIndex}`,
        searchParams: {
          waitForSecDef: true,
        },
        guard: optional(PositionsResponse),
        signal,
        timeout,
      })

      if (page === undefined) {
        break
      }

      records.push(...page)

      // todo is there a way we can avoid hardcoding "100" here?
      if (page.length < 100) {
        break
      }

      pageIndex++
    }

    return records
  }
}
