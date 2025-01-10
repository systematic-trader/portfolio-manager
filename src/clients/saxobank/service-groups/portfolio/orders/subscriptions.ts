import type { ArgumentType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import type { OrderFieldGroup } from '../../../types/derives/order-field-group.ts'
import type { OpenOrdersRequest } from '../../../types/records/open-orders-request.ts'
import { OrderSubscriptionListResponse } from '../../../types/records/order-subscription-list-response.ts'

const FieldGroups: OrderFieldGroup[] = [
  'DisplayAndFormat',
  // 'ExchangeInfo', // There is a bug on simulation where empty strings will be returned for exchanges when this field is included (exchange info still seems to get included if it is omitted though)
  'Greeks',
]

export class Subscriptions {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('subscriptions')
  }

  async post(
    options: {
      readonly Arguments: ArgumentType<OpenOrdersRequest>
      readonly ContextId: string
      readonly Format?: undefined | 'application/json' | 'application/x-protobuf'
      readonly ReferenceId: string
      readonly RefreshRate?: undefined | number
      readonly ReplaceReferenceId?: undefined | string
      readonly Tag?: undefined | string
    },
    httpOptions: undefined | { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal } = {},
  ): Promise<OrderSubscriptionListResponse> {
    return await this.#client.post({
      body: {
        ...options,
        Arguments: {
          ...options.Arguments,
          FieldGroups,
        },
      },
      guard: OrderSubscriptionListResponse,
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
