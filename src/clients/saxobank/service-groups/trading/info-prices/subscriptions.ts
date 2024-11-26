import {
  type ArgumentType,
  array,
  boolean,
  enums,
  format,
  type Guard,
  type GuardType,
  integer,
  number,
  type ObjectGuard,
  optional,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../../service-group-client.ts'
import { InfoPriceGroupSpec } from '../../../types/derives/info-price-group-spec.ts'
import { OrderAmountType } from '../../../types/derives/order-amount-type.ts'
import { ToOpenClose } from '../../../types/derives/to-open-close.ts'
import { InfoPriceResponse } from '../../../types/records/info-price-response.ts'

export type InfoPricesSubscriptionsResponse = GuardType<
  typeof InfoPricesSubscriptionsResponse[keyof typeof InfoPricesSubscriptionsResponse]
>

// const InfoPricesSubscriptionsResponse = props({
//   /**
//    * The streaming context id that this response is associated with.
//    */
//   ContextId: string(),

//   /**
//    * The media type (RFC 2046), of the serialized data updates that are streamed to the client.
//    */
//   Format: enums(['application/json', 'application/x-protobuf']),

//   /**
//    * The time (in seconds) that the client should accept the subscription to be inactive before considering it invalid.
//    */
//   InactivityTimeout: integer(),

//   /**
//    * The reference id that (along with streaming context id and session id) identifies the subscription (within the context of a specific service/subscription type)
//    */
//   ReferenceId: string(),

//   /**
//    * Actual refresh rate assigned to the subscription according to the customers SLA.
//    */
//   RefreshRate: integer({ minimum: 1000 }),

//   /**
//    * Snapshot of the current data on hand, when subscription was created.
//    */
//   Snapshot: unknown(),

//   /**
//    * This property is kept for backwards compatibility.
//    */
//   State: string(),

//   /**
//    * Client specified tag assigned to the subscription, if specified in the request.
//    */
//   Tag: optional(string()),
// })

const InfoPricesSubscriptionsResponse = Object.fromEntries(
  Object.entries(InfoPriceResponse).map(([key, snapshotGuard]) => {
    return [
      key,
      props({
        /**
         * The streaming context id that this response is associated with.
         */
        ContextId: string(),

        /**
         * The media type (RFC 2046), of the serialized data updates that are streamed to the client.
         */
        Format: enums(['application/json', 'application/x-protobuf']),

        /**
         * The time (in seconds) that the client should accept the subscription to be inactive before considering it invalid.
         */
        InactivityTimeout: integer(),

        /**
         * The reference id that (along with streaming context id and session id) identifies the subscription (within the context of a specific service/subscription type)
         */
        ReferenceId: string(),

        /**
         * Actual refresh rate assigned to the subscription according to the customers SLA.
         */
        RefreshRate: integer({ minimum: 1000 }),

        /**
         * Snapshot of the current data on hand, when subscription was created.
         */
        Snapshot: props({
          Data: array(snapshotGuard),
        }),

        /**
         * This property is kept for backwards compatibility.
         */
        State: string(),

        /**
         * Client specified tag assigned to the subscription, if specified in the request.
         */
        Tag: optional(string()),
      }),
    ]
  }),
) as unknown as {
  [K in keyof typeof InfoPriceResponse]: ObjectGuard<{
    ContextId: Guard<string>
    Format: Guard<'application/json' | 'application/x-protobuf'>
    InactivityTimeout: Guard<number>
    ReferenceId: Guard<string>
    RefreshRate: Guard<number>
    Snapshot: ObjectGuard<{ Data: Guard<ReadonlyArray<InfoPriceResponse[K]>> }>
    State: Guard<string>
    Tag: Guard<string>
  }>
}

export interface InfoPriceListRequest extends ArgumentType<GuardType<typeof InfoPriceListRequest>> {}

export const InfoPriceListRequest = props({
  /**
   * Unique key identifying the account used in retrieving the infoprice. Only required when calling context represents an authenticated user. If not supplied a default account is assumed.
   */
  AccountKey: optional(string()),

  /**
   * Order size, defaults to minimal order size for given instrument.
   */
  Amount: optional(number()),

  AmountType: optional(OrderAmountType),

  /**
   * The instrument's asset type
   */
  AssetType: enums(
    Object.keys(InfoPricesSubscriptionsResponse) as ReadonlyArray<keyof typeof InfoPricesSubscriptionsResponse>,
  ),

  /**
   * Specification of field groups to return in results. Default is "Quote"
   */
  FieldGroups: optional(InfoPriceGroupSpec),

  ForwardDate: optional(format('date-iso8601')),

  /**
   * Forward date for far leg
   */
  ForwardDateFarLeg: optional(format('date-iso8601')),

  /**
   * Forward date for near leg
   */
  ForwardDateNearLeg: optional(format('date-iso8601')),

  /**
   * Order ask price. When specified, a corresponding cost of buying will be calculated for that price; otherwise the current market ask price will be used.
   */
  OrderAskPrice: optional(number()),

  /**
   * Order bid price. When specified, a corresponding cost of selling will be calculated for that price; otherwise the current market bid price will be used.
   */
  OrderBidPrice: optional(number()),

  QuoteCurrency: optional(boolean()),

  ToOpenClose: optional(ToOpenClose),

  /**
   * A list of Uics.
   */
  Uics: array(union([format('positive-integer'), integer()]), { length: { minimum: 1 } }),
})

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
      readonly Arguments: InfoPriceListRequest
      /**
       * The streaming context id that this request is associated with. This parameter must only contain letters (a-z) and numbers (0-9) as well as - (dash) and _ (underscore). It is case insensitive. Max length is 50 characters.
       */
      readonly ContextId: string

      /**
       * Optional Media type (RFC 2046) of the serialized data updates that are streamed to the client. Currently only application/json and application/x-protobuf is supported. If an unrecognized format is specified, the subscription end point will return HTTP status code 400 - Bad format.
       */
      readonly Format?: undefined | 'application/json' | 'application/x-protobuf'

      /**
       * Mandatory client specified reference id for the subscription. This parameter must only contain alphanumberic characters as well as - (dash) and _ (underscore). Cannot start with _. It is case insensitive. Max length is 50 characters.
       */
      readonly ReferenceId: string

      /**
       * Optional custom refresh rate, measured in milliseconds, between each data update. Note that it is not possible to get a refresh rate lower than the rate specified in the customer service level agreement (SLA).
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
  ): Promise<InfoPricesSubscriptionsResponse> {
    return (await this.#client.post({
      body: {
        ...options,
        Arguments: {
          ...options.Arguments,
          Uics: options.Arguments.Uics.join(','),
        },
      },
      guard: InfoPricesSubscriptionsResponse[options.Arguments.AssetType] as Guard<unknown>,
      timeout: httpOptions.timeout,
      signal: httpOptions.signal,
    })) as InfoPricesSubscriptionsResponse
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

    await client.delete(httpOptions)
  }
}
