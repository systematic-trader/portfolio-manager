import {
  type GuardType,
  literal,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../../resource-client.ts'

export const InvalidatePositionsResponse = props({
  message: literal('success'),
})

export type InvalidatePositionsResponse = GuardType<typeof InvalidatePositionsResponse>

export class Invalidate {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  /**
   * Instructs IB to discard cached portfolio positions for a given account,
   * so that the next request for positions delivers freshly obtained data.
   */
  async post({ accountId }: {
    readonly accountId: string
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<InvalidatePositionsResponse> {
    return await this.#client.post({
      path: `${accountId}/positions/invalidate`,
      guard: InvalidatePositionsResponse,
      signal,
      timeout,
    })
  }
}
