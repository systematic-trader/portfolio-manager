import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import { DeleteOrderResponse } from '../../../types/record/delete-order-response.ts'

export class Order {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  async delete({ accountId, orderId, manualIndicator }: {
    readonly accountId: string
    readonly orderId: number
    readonly manualIndicator: boolean
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<DeleteOrderResponse> {
    return await this.#client.delete({
      path: `${accountId}/order/${orderId}`,
      searchParams: {
        manualIndicator,
      },
      guard: DeleteOrderResponse,
      signal,
      timeout,
    })
  }
}
