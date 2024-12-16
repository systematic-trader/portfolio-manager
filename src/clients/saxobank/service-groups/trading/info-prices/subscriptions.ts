import {
  type ArgumentType,
  assertReturn,
  unknown,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import type { InfoPriceGroupSpec } from '../../../types/derives/info-price-group-spec.ts'
import type { InfoPriceListRequest } from '../../../types/records/info-price-list-request.ts'
import { InfoPriceSubscriptionResponse } from '../../../types/records/info-price-subscription-response.ts'

export class Subscriptions {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('subscriptions')
  }

  async post<AssetType extends keyof InfoPriceListRequest>(
    options: {
      /**
       * Arguments for the subscription request.
       */
      readonly Arguments: ArgumentType<
        Extract<InfoPriceListRequest[keyof InfoPriceListRequest], { readonly AssetType: AssetType }>
      >

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
    httpOptions?: undefined | { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal },
  ): Promise<
    Extract<
      InfoPriceSubscriptionResponse[keyof InfoPriceSubscriptionResponse],
      { readonly Snapshot: { readonly Data: readonly { readonly AssetType: AssetType }[] } }
    >
  >

  async post(
    options: {
      readonly Arguments: ArgumentType<InfoPriceListRequest[keyof InfoPriceListRequest]>
      readonly ContextId: string
      readonly Format?: undefined | 'application/json' | 'application/x-protobuf'
      readonly ReferenceId: string
      readonly RefreshRate?: undefined | number
      readonly ReplaceReferenceId?: undefined | string
      readonly Tag?: undefined | string
    },
    httpOptions: undefined | { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal } = {},
  ): Promise<InfoPriceSubscriptionResponse[keyof InfoPriceSubscriptionResponse]> {
    const FieldGroups: readonly InfoPriceGroupSpec[] = [
      'Commissions',
      'DisplayAndFormat',
      'Greeks',
      'HistoricalChanges',
      'InstrumentPriceDetails',
      'MarketDepth',
      'PriceInfo',
      'PriceInfoDetails',
      'Quote',
    ]

    const response = await this.#client.post({
      body: {
        ...options,
        Arguments: {
          FieldGroups,
          ...options.Arguments,
          Uics: options.Arguments.Uics.join(','),
        },
      },
      guard: unknown(),
      timeout: httpOptions.timeout,
      signal: httpOptions.signal,
    }).execute()

    switch (options.Arguments.AssetType) {
      case 'Bond': {
        return assertReturn(InfoPriceSubscriptionResponse['Bond'], response)
      }

      case 'CfdOnEtc': {
        return assertReturn(InfoPriceSubscriptionResponse['CfdOnEtc'], response)
      }

      case 'CfdOnEtf': {
        return assertReturn(InfoPriceSubscriptionResponse['CfdOnEtf'], response)
      }

      case 'CfdOnEtn': {
        return assertReturn(InfoPriceSubscriptionResponse['CfdOnEtn'], response)
      }

      case 'CfdOnFund': {
        return assertReturn(InfoPriceSubscriptionResponse['CfdOnFund'], response)
      }

      case 'CfdOnFutures': {
        return assertReturn(InfoPriceSubscriptionResponse['CfdOnFutures'], response)
      }

      case 'CfdOnIndex': {
        return assertReturn(InfoPriceSubscriptionResponse['CfdOnIndex'], response)
      }

      case 'CfdOnStock': {
        return assertReturn(InfoPriceSubscriptionResponse['CfdOnStock'], response)
      }

      case 'ContractFutures': {
        return assertReturn(InfoPriceSubscriptionResponse['ContractFutures'], response)
      }

      case 'Etc': {
        return assertReturn(InfoPriceSubscriptionResponse['Etc'], response)
      }

      case 'Etf': {
        return assertReturn(InfoPriceSubscriptionResponse['Etf'], response)
      }

      case 'Etn': {
        return assertReturn(InfoPriceSubscriptionResponse['Etn'], response)
      }

      case 'Fund': {
        return assertReturn(InfoPriceSubscriptionResponse['Fund'], response)
      }

      case 'FxForwards': {
        return assertReturn(InfoPriceSubscriptionResponse['FxForwards'], response)
      }

      case 'FxSpot': {
        return assertReturn(InfoPriceSubscriptionResponse['FxSpot'], response)
      }

      case 'Stock': {
        return assertReturn(InfoPriceSubscriptionResponse['Stock'], response)
      }

      default: {
        throw new Error('Unsupported asset type')
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
