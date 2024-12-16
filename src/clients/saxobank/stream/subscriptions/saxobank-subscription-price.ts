import {
  type ArgumentType,
  assert,
  assertReturn,
  coerce,
  type GuardType,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { mergeDeltaCompressedValue } from '../../../../utils/merge-delta-compressed-value.ts'
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

const Payload = props({}, { extendable: true })

interface Payload extends GuardType<typeof Payload> {}

export type SaxoBankSubscriptionPriceMessage = GuardType<typeof PriceResponseUnion>

export class SaxoBankSubscriptionPrice<AssetType extends keyof PriceRequest>
  extends SaxoBankSubscription<SaxoBankSubscriptionPriceMessage> {
  readonly options: ArgumentType<PriceRequest[AssetType]>

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
      subscribe: createSubscribe({ assetType: options.AssetType, uic: options.Uic }),
      unsubscribe,
      signal,
      timeout,
    })

    this.options = options
  }
}

const parse: SaxoBankSubscriptionParse<SaxoBankSubscriptionPriceMessage> = (previous, payload) => {
  assert(Payload, payload)

  const merged = mergeDeltaCompressedValue(previous, payload)

  assert(PriceResponseUnion, merged)

  return [merged]
}

function createReferenceIdGenerator({ assetType, uic }: {
  readonly assetType: keyof PriceRequest
  readonly uic: number
}): SaxoBankSubscriptionCreateReferenceId {
  return () => SaxoBankRandom.stream.referenceId(`price-${assetType}-${uic}`)
}

function createSubscribe({ assetType, uic }: {
  readonly assetType: keyof PriceRequest
  readonly uic: number
}): SaxoBankSubscriptionSubscribe<SaxoBankSubscriptionPriceMessage> {
  return async function subscribe({ app, contextId, referenceId, previousReferenceId, timeout, signal }) {
    const response = await app.trading.prices.subscriptions.post({
      Arguments: {
        AssetType: assetType,
        Uic: uic,
      },
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
