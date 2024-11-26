import { literal } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../service-group-client.ts'

const DeleteSubscriptionsResponse = literal(undefined)

export class Subscriptions {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/subscriptions')
  }

  /**
   * Removes multiple subscriptions for the current session, and frees all resources on the server.
   */
  async delete(
    { ContextId, Tag }: {
      /** Unique streaming context ID part of the streaming session */
      readonly ContextId: string

      /** Tag that subscriptions are marked with */
      readonly Tag?: undefined | string
    },
    options: { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal } = {},
  ): Promise<void> {
    return await this.#client.delete({
      path: ContextId,
      searchParams: {
        Tag,
      },
      guard: DeleteSubscriptionsResponse,
      timeout: options.timeout,
      signal: options.signal,
    })
  }
}
