import {
  type ArgumentType,
  array,
  assertReturn,
  coerce,
  format,
  integer,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { PromiseQueue } from '../../../../utils/promise-queue.ts'
import type { SaxoBankStream } from '../../../saxobank-stream.ts'
import { SaxoBankRandom } from '../../saxobank-random.ts'
import { AssetType } from '../../types/derives/asset-type.ts'
import type { InfoPriceRequest } from '../../types/records/info-price-request.ts'
import { Quote } from '../../types/records/quote.ts'
import {
  SaxoBankSubscription,
  type SaxoBankSubscriptionCreateReferenceId,
  type SaxoBankSubscriptionParse,
  type SaxoBankSubscriptionSubscribe,
  type SaxoBankSubscriptionUnsubscribe,
} from '../saxobank-subscription.ts'

export interface SaxoBankSubscriptionInfoPriceMessage {
  readonly assetType: AssetType
  readonly uic: number
  readonly lastUpdated: string
  readonly quote: Quote
}

const MessageGuard = props({
  assetType: AssetType,
  uic: integer(),
  lastUpdated: format('date-iso8601'),
  quote: Quote,
})

const MessagesGuard = array(MessageGuard)

export class SaxoBankSubscriptionInfoPrice<AssetType extends keyof InfoPriceRequest>
  extends SaxoBankSubscription<SaxoBankSubscriptionInfoPriceMessage> {
  readonly options: ArgumentType<InfoPriceRequest[AssetType]>

  constructor({
    options,
    queue,
    signal,
    stream,
    timeout,
  }: {
    readonly stream: SaxoBankStream
    readonly queue: PromiseQueue
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
    readonly options: ArgumentType<InfoPriceRequest[AssetType]>
  }) {
    super({
      stream,
      queue,
      parse,
      createReferenceId: createReferenceIdGenerator({ assetType: options.AssetType, uic: options.Uic }),
      subscribe: createSubscribe({ assetType: options.AssetType, uic: options.Uic }),
      unsubscribe,
      signal,
      timeout,
    })

    this.options = options
  }
}

const parse: SaxoBankSubscriptionParse<SaxoBankSubscriptionInfoPriceMessage> = (previous, payload) => {
  if (Array.isArray(payload)) {
    const messages: SaxoBankSubscriptionInfoPriceMessage[] = []

    let current = previous

    for (const message of payload) {
      current = {
        assetType: previous.assetType,
        uic: previous.uic,
        lastUpdated: message.LastUpdated,
        quote: {
          ...current.quote,
          ...message.Quote,
        },
      }

      messages.push(current)
    }

    return assertReturn(MessagesGuard, coerce(MessagesGuard)(messages))
  }

  return []
}

function createReferenceIdGenerator(
  { assetType, uic }: { readonly assetType: AssetType; readonly uic: number },
): SaxoBankSubscriptionCreateReferenceId {
  return () => SaxoBankRandom.stream.referenceId(`info-price-${assetType}-${uic}`)
}

function createSubscribe(
  { assetType, uic }: { readonly assetType: AssetType; readonly uic: number },
): SaxoBankSubscriptionSubscribe<SaxoBankSubscriptionInfoPriceMessage> {
  return async function subscribe(
    { app, contextId, referenceId, previousReferenceId, timeout, signal },
  ) {
    const response = await app.trading.infoPrices.subscriptions.post({
      Arguments: {
        AssetType: assetType as never,
        Uics: [uic],
      },
      ContextId: contextId,
      ReferenceId: referenceId,
      ReplaceReferenceId: previousReferenceId,
      Format: 'application/json',
      RefreshRate: 1000,
      Tag: referenceId, // Used to identify the subscription in the WebSocket messages, if the subscription is somehow lost in registration or re-registration
    }, {
      timeout,
      signal,
    })

    const message = assertReturn(
      MessageGuard,
      coerce(MessageGuard)({
        assetType,
        uic,
        lastUpdated: response.Snapshot.Data[0]!.LastUpdated,
        quote: response.Snapshot.Data[0]!.Quote,
      }),
    )

    return {
      referenceId: response.ReferenceId,
      inactivityTimeout: response.InactivityTimeout * 1000,
      message,
    }
  }
}

const unsubscribe: SaxoBankSubscriptionUnsubscribe = async ({ app, contextId, referenceId, timeout, signal }) => {
  await app.trading.infoPrices.subscriptions.delete({
    ContextId: contextId,
    ReferenceId: referenceId,
  }, {
    timeout,
    signal,
  })
}
