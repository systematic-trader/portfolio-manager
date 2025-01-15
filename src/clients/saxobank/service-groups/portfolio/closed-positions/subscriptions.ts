import type { ArgumentType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import type { ClosedPositionFieldGroup } from '../../../types/derives/closed-position-field-group.ts'
import { ClosedPositionSubscriptionListResponse } from '../../../types/records/closed-position-subscription-list-response.ts'
import type { ClosedPositionsRequest } from '../../../types/records/closed-positions-request.ts'

const FieldGroups: ClosedPositionFieldGroup[] = [
  'ClosedPosition',
  'ClosedPositionDetails',
  'DisplayAndFormat',
  'ExchangeInfo',
]

export class Subscriptions {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('subscriptions')
  }

  async post(
    options: {
      readonly Arguments: ArgumentType<ClosedPositionsRequest>
      readonly ContextId: string
      readonly Format?: undefined | 'application/json' | 'application/x-protobuf'
      readonly ReferenceId: string
      readonly RefreshRate?: undefined | number
      readonly ReplaceReferenceId?: undefined | string
      readonly Tag?: undefined | string
    },
    httpOptions: undefined | { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal } = {},
  ): Promise<ClosedPositionSubscriptionListResponse> {
    return await this.#client.post({
      body: {
        ...options,
        Arguments: {
          ...options.Arguments,
          FieldGroups,
        },
      },
      guard: ClosedPositionSubscriptionListResponse,
      timeout: httpOptions.timeout,
      signal: httpOptions.signal,
    }).execute()
  }

  async delete(
    options: {
      readonly ContextId: string
      readonly ReferenceId: string
    },
    httpOptions?: undefined | {
      readonly timeout?: undefined | number
      readonly signal?: undefined | AbortSignal
    },
  ): Promise<void> {
    const client = this.#client.appendPath(`${options.ContextId}/${options.ReferenceId}`)

    await client.delete(httpOptions).execute()
  }
}