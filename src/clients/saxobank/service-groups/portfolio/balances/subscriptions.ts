import type { ArgumentType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import { BalanceFieldGroupValues } from '../../../types/derives/balance-field-group.ts'
import type { BalanceRequest } from '../../../types/records/balance-request.ts'
import { BalanceSubscriptionResponse } from '../../../types/records/balance-subscription-response.ts'

export class Subscriptions {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('subscriptions')
  }

  async post(
    options: {
      readonly Arguments: ArgumentType<BalanceRequest>
      readonly ContextId: string
      readonly Format?: undefined | 'application/json' | 'application/x-protobuf'
      readonly ReferenceId: string
      readonly RefreshRate?: undefined | number
      readonly ReplaceReferenceId?: undefined | string
      readonly Tag?: undefined | string
    },
    httpOptions: undefined | { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal } = {},
  ): Promise<BalanceSubscriptionResponse> {
    return await this.#client.post({
      body: {
        ...options,
        Arguments: {
          FieldGroups: BalanceFieldGroupValues,
          ...options.Arguments,
        },
      },
      guard: BalanceSubscriptionResponse,
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
