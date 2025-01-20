import {
  type ArgumentType,
  assert,
  assertReturn,
  coerce,
  type GuardType,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { mergeDeltaContent } from '../../../../utils/merge-delta-content.ts'
import type { PromiseQueue } from '../../../../utils/promise-queue.ts'
import type { SaxoBankStream } from '../../../saxobank-stream.ts'
import { SaxoBankRandom } from '../../saxobank-random.ts'
import type { PriceRequest } from '../../types/records/price-request.ts'
import { PriceResponseUnion } from '../../types/records/price-response.ts'
import {
  SaxoBankSubscription,
  type SaxoBankSubscriptionCreateReferenceId,
  type SaxoBankSubscriptionParse,
  type SaxoBankSubscriptionSubscribe,
  type SaxoBankSubscriptionUnsubscribe,
} from '../saxobank-subscription.ts'

export type SaxoBankSubscriptionPriceMessage = GuardType<typeof PriceResponseUnion>

export class SaxoBankSubscriptionPrice<AssetType extends keyof PriceRequest>
  extends SaxoBankSubscription<SaxoBankSubscriptionPriceMessage> {
  readonly options: PriceRequest[AssetType]

  constructor({
    stream,
    queue,
    options,
    signal,
    timeout,
  }: {
    readonly stream: SaxoBankStream
    readonly queue: PromiseQueue
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
    readonly options: ArgumentType<PriceRequest[AssetType]>
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

    this.options = options as PriceRequest[AssetType]
  }
}

const parse: SaxoBankSubscriptionParse<SaxoBankSubscriptionPriceMessage> = (previous, payload) => {
  const merged = mergeDeltaContent(previous, payload)

  assert(PriceResponseUnion, merged)

  return [merged]
}

function createReferenceIdGenerator({ assetType, uic }: {
  readonly assetType: keyof PriceRequest
  readonly uic: number
}): SaxoBankSubscriptionCreateReferenceId {
  return () => SaxoBankRandom.stream.referenceID(`price-${assetType}-${uic}`)
}

function createSubscribe<AssetType extends keyof PriceRequest>(
  options: ArgumentType<PriceRequest[AssetType]>,
): SaxoBankSubscriptionSubscribe<SaxoBankSubscriptionPriceMessage> {
  return async function subscribe({ app, contextId, referenceId, previousReferenceId, timeout, signal }): Promise<{
    referenceId: string
    inactivityTimeout: number
    message: SaxoBankSubscriptionPriceMessage
  }> {
    const response = await app.trading.prices.subscriptions.post({
      Arguments: options,
      ContextId: contextId,
      ReferenceId: referenceId,
      ReplaceReferenceId: previousReferenceId,
      Format: 'application/json',
      RefreshRate: 1000,
      Tag: referenceId, // Used to identify the subscription in the WebSocket messages, if the subscription is somehow lost in registration or re-registration
    }, { timeout, signal })

    const message = assertReturn(
      PriceResponseUnion,
      coerce(PriceResponseUnion)(response.Snapshot),
    )

    return {
      referenceId: response.ReferenceId,
      inactivityTimeout: response.InactivityTimeout * 1000,
      message,
    }
  }
}

const unsubscribe: SaxoBankSubscriptionUnsubscribe = async ({ app, contextId, referenceId, timeout, signal }) => {
  await app.trading.prices.subscriptions.delete({
    ContextId: contextId,
    ReferenceId: referenceId,
  }, { timeout, signal })
}
