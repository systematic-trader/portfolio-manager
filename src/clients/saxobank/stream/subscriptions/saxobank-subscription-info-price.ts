import {
  type ArgumentType,
  array,
  assertReturn,
  coerce,
  enums,
  integer,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { extractKeys } from '../../../../utils/object.ts'
import type { PromiseQueue } from '../../../../utils/promise-queue.ts'
import type { SaxoBankStream } from '../../../saxobank-stream.ts'
import { SaxoBankRandom } from '../../saxobank-random.ts'
import { InfoPriceListRequest } from '../../types/records/info-price-list-request.ts'
import { Quote } from '../../types/records/quote.ts'
import {
  SaxoBankSubscription,
  type SaxoBankSubscriptionCreateReferenceId,
  type SaxoBankSubscriptionParse,
  type SaxoBankSubscriptionSubscribe,
  type SaxoBankSubscriptionUnsubscribe,
} from '../saxobank-subscription.ts'

export type InfoPriceSibscriptionOptions = {
  [K in keyof InfoPriceListRequest]: Omit<ArgumentType<InfoPriceListRequest[K]>, 'Uics'> & { readonly Uic: number }
}

export interface SaxoBankSubscriptionInfoPriceMessage {
  readonly assetType: keyof InfoPriceListRequest
  readonly uic: number
  readonly quote: Quote
}

const MessageGuard = props({
  assetType: enums(extractKeys(InfoPriceListRequest)),
  uic: integer(),
  quote: Quote,
})

const MessagesGuard = array(MessageGuard)

export class SaxoBankSubscriptionInfoPrice<AssetType extends keyof InfoPriceSibscriptionOptions>
  extends SaxoBankSubscription<SaxoBankSubscriptionInfoPriceMessage> {
  readonly options: InfoPriceSibscriptionOptions[AssetType]

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
    readonly options: InfoPriceSibscriptionOptions[AssetType]
  }) {
    super({
      stream,
      queue,
      parse,
      createReferenceId: createReferenceIdGenerator({ assetType: options.AssetType, uic: options.Uic }),
      subscribe: createSubscribe(options),
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

function createReferenceIdGenerator<AssetType extends keyof InfoPriceSibscriptionOptions>(
  { assetType, uic }: { readonly assetType: AssetType; readonly uic: number },
): SaxoBankSubscriptionCreateReferenceId {
  return () => SaxoBankRandom.stream.referenceId(`info-price-${assetType}-${uic}`)
}

function createSubscribe<AssetType extends keyof InfoPriceSibscriptionOptions>(
  options: InfoPriceSibscriptionOptions[AssetType],
): SaxoBankSubscriptionSubscribe<SaxoBankSubscriptionInfoPriceMessage> {
  return async function subscribe({ app, contextId, referenceId, previousReferenceId, timeout, signal }): Promise<{
    referenceId: string
    inactivityTimeout: number
    message: SaxoBankSubscriptionInfoPriceMessage
  }> {
    const response = await app.trading.infoPrices.subscriptions.post({
      Arguments: {
        ...options,
        Uic: undefined,
        Uics: [options.Uic],
      },
      ContextId: contextId,
      ReferenceId: referenceId,
      ReplaceReferenceId: previousReferenceId,
      Format: 'application/json',
      RefreshRate: 1000,
      Tag: referenceId, // Used to identify the subscription in the WebSocket messages, if the subscription is somehow lost in registration or re-registration
    }, { timeout, signal })

    const message = assertReturn(
      MessageGuard,
      coerce(MessageGuard)({
        assetType: options.AssetType,
        uic: options.Uic,
        quote: response.Snapshot.Data[0]?.Quote,
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
  }, { timeout, signal })
}
