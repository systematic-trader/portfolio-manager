import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import {
  type SuppressibleMessageIds,
  SuppressibleMessageIdValues,
} from '../../../types/derived/suppressible-message-ids.ts'
import { SuppressQuestionsResponse } from '../../../types/record/suppres-questions-response.ts'
import { Reset } from './suppress/reset.ts'

export class Suppress {
  readonly #client: InteractiveBrokersResourceClient

  readonly reset: Reset

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('suppress')

    this.reset = new Reset(this.#client)
  }

  /**
   * Suppress the specified order reply messages for the duration of the brokerage session.
   */
  async post({ messageIds = SuppressibleMessageIdValues }: {
    readonly messageIds?: undefined | SuppressibleMessageIds | readonly SuppressibleMessageIds[]
  } = {}, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<SuppressQuestionsResponse> {
    return await this.#client.post({
      guard: SuppressQuestionsResponse,
      body: {
        messageIds: typeof messageIds === 'string' ? [messageIds] : messageIds,
      },
      signal,
      timeout,
    })
  }
}
