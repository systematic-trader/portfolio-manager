import {
  type ArgumentType,
  assertReturn,
  unknown,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import type { PriceGroupSpec } from '../../../types/derives/price-group-spec.ts'
import type { PriceRequest } from '../../../types/records/price-request.ts'
import { PriceSubscriptionResponse } from '../../../types/records/price-subscription-response.ts'

export class Subscriptions {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('subscriptions')
  }

  async post(
    options: {
      /**
       * Arguments for the subscription request.
       */
      readonly Arguments: ArgumentType<PriceRequest[keyof PriceRequest]>

      /**
       * The streaming context id that this request is associated with.
       * This parameter must only contain letters (a-z) and numbers (0-9) as well as - (dash) and _ (underscore).
       * It is case insensitive. Max length is 50 characters.
       */
      readonly ContextId: string

      /**
       * Optional Media type (RFC 2046) of the serialized data updates that are streamed to the client.
       * Currently only application/json and application/x-protobuf is supported.
       * If an unrecognized format is specified, the subscription end point will return HTTP status code 400 - Bad format.
       */
      readonly Format?: undefined | 'application/json' | 'application/x-protobuf'

      /**
       * Mandatory client specified reference id for the subscription.
       * This parameter must only contain alphanumberic characters as well as - (dash) and _ (underscore). Cannot start with _.
       * It is case insensitive. Max length is 50 characters.
       */
      readonly ReferenceId: string

      /**
       * Optional custom refresh rate, measured in milliseconds, between each data update.
       * Note that it is not possible to get a refresh rate lower than the rate specified in the customer service level agreement (SLA).
       */
      readonly RefreshRate?: undefined | number

      /**
       * Reference id of the subscription that should be replaced.
       */
      readonly ReplaceReferenceId?: undefined | string

      /**
       * Optional client specified tag used for grouping subscriptions.
       */
      readonly Tag?: undefined | string
    },
    httpOptions: undefined | { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal } = {},
  ): Promise<PriceSubscriptionResponse[keyof PriceSubscriptionResponse]> {
    const FieldGroups: readonly PriceGroupSpec[] = [
      'Commissions',
      'DisplayAndFormat',
      'Greeks',
      'HistoricalChanges',
      'InstrumentPriceDetails',
      'MarginImpactBuySell',
      'MarketDepth',
      'PriceInfo',
      'PriceInfoDetails',
      'Quote',
      'Timestamps',
    ]

    const response = await this.#client.post({
      body: {
        ...options,
        Arguments: {
          ...options.Arguments,
          FieldGroups,
        },
      },
      guard: unknown(),
      timeout: httpOptions.timeout,
      signal: httpOptions.signal,
    }).execute()

    switch (options.Arguments.AssetType) {
      case 'Bond': {
        return assertReturn(PriceSubscriptionResponse['Bond'], response)
      }

      case 'CfdOnEtc': {
        return assertReturn(PriceSubscriptionResponse['CfdOnEtc'], response)
      }

      case 'CfdOnEtf': {
        return assertReturn(PriceSubscriptionResponse['CfdOnEtf'], response)
      }

      case 'CfdOnEtn': {
        return assertReturn(PriceSubscriptionResponse['CfdOnEtn'], response)
      }

      case 'CfdOnFund': {
        return assertReturn(PriceSubscriptionResponse['CfdOnFund'], response)
      }

      case 'CfdOnFutures': {
        return assertReturn(PriceSubscriptionResponse['CfdOnFutures'], response)
      }

      case 'CfdOnIndex': {
        return assertReturn(PriceSubscriptionResponse['CfdOnIndex'], response)
      }

      case 'CfdOnStock': {
        return assertReturn(PriceSubscriptionResponse['CfdOnStock'], response)
      }

      case 'ContractFutures': {
        return assertReturn(PriceSubscriptionResponse['ContractFutures'], response)
      }

      case 'Etc': {
        return assertReturn(PriceSubscriptionResponse['Etc'], response)
      }

      case 'Etf': {
        return assertReturn(PriceSubscriptionResponse['Etf'], response)
      }

      case 'Etn': {
        return assertReturn(PriceSubscriptionResponse['Etn'], response)
      }

      case 'Fund': {
        return assertReturn(PriceSubscriptionResponse['Fund'], response)
      }

      case 'FxForwards': {
        return assertReturn(PriceSubscriptionResponse['FxForwards'], response)
      }

      case 'FxSpot': {
        return assertReturn(PriceSubscriptionResponse['FxSpot'], response)
      }

      case 'Stock': {
        return assertReturn(PriceSubscriptionResponse['Stock'], response)
      }
    }
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
