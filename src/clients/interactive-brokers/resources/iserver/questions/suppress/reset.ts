import type { InteractiveBrokersResourceClient } from '../../../../resource-client.ts'
import { ResetSuppressedQuestionsResponse } from '../../../../types/record/reset-suppressed-questions-response.ts'

export class Reset {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('reset')
  }

  /**
   * Removes suppression of all order reply messages that were previously suppressed in the current brokerage session.
   */
  async post({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<ResetSuppressedQuestionsResponse> {
    return await this.#client.post({
      guard: ResetSuppressedQuestionsResponse,
      signal,
      timeout,
    })
  }
}
