import {
  type ArgumentType,
  array,
  assert,
  assertReturn,
  coerce,
  is,
  literal,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { PromiseQueue } from '../../../../utils/promise-queue.ts'
import type { SaxoBankStream } from '../../../saxobank-stream.ts'
import { SaxoBankRandom } from '../../saxobank-random.ts'
import type { OpenOrdersRequest } from '../../types/records/open-orders-request.ts'
import { OrderResponseUnion } from '../../types/records/order-response.ts'
import {
  SaxoBankSubscription,
  type SaxoBankSubscriptionCreateReferenceId,
  type SaxoBankSubscriptionParse,
  type SaxoBankSubscriptionSubscribe,
  type SaxoBankSubscriptionUnsubscribe,
} from '../saxobank-subscription.ts'

const Payload = props({
  OrderId: string(),
})

const PayloadOrderDeleted = Payload.merge({
  '__meta_seleted': literal(true),
})

const isPayloadOrderDeleted = is(PayloadOrderDeleted)

export class SaxoBankSubscriptionOrders extends SaxoBankSubscription<readonly OrderResponseUnion[]> {
  readonly options: OpenOrdersRequest

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
    readonly options: ArgumentType<OpenOrdersRequest>
  }) {
    super({
      stream,
      queue,
      parse,
      createReferenceId: createReferenceIdGenerator(options),
      subscribe: createSubscribe(options),
      unsubscribe,
      signal,
      timeout,
    })

    this.options = options as OpenOrdersRequest
  }
}

const parse: SaxoBankSubscriptionParse<readonly OrderResponseUnion[]> = (previous, payload) => {
  console.log('payload', payload)

  assert(Payload, payload)

  if (isPayloadOrderDeleted(payload)) {
    const index = previous.findIndex((order) => order.OrderId === payload.OrderId)

    if (index === -1) {
      throw new Error(`Unknown order has been deleted: ${payload.OrderId}`)
    }

    return [[...previous.slice(0, index), ...previous.slice(index + 1)]]
  }

  return []
}

function createReferenceIdGenerator(options: ArgumentType<OpenOrdersRequest>): SaxoBankSubscriptionCreateReferenceId {
  const accountGroupKey = options.AccountGroupKey === undefined ? undefined : `g${options.AccountGroupKey}`
  const accountKey = options.AccountKey === undefined ? undefined : `a${options.AccountKey}`
  const clientKey = options.ClientKey === undefined ? undefined : `c${options.ClientKey}`

  const infix = [accountGroupKey, accountKey, clientKey]
    .filter((candidate) => candidate !== undefined)
    .join('-')
    .replace(/[^a-zA-Z]/g, 'x')

  return () => SaxoBankRandom.stream.referenceId(`orders-${infix}`)
}

function createSubscribe(
  options: ArgumentType<OpenOrdersRequest>,
): SaxoBankSubscriptionSubscribe<readonly OrderResponseUnion[]> {
  return async function subscribe({ app, contextId, referenceId, previousReferenceId, timeout, signal }): Promise<{
    readonly referenceId: string
    readonly message: readonly OrderResponseUnion[]
    readonly inactivityTimeout: number
  }> {
    const response = await app.portfolio.orders.subscriptions.post({
      Arguments: options,
      ContextId: contextId,
      ReferenceId: referenceId,
      ReplaceReferenceId: previousReferenceId,
      Format: 'application/json',
      RefreshRate: 1000,
      Tag: referenceId, // Used to identify the subscription in the WebSocket messages, if the subscription is somehow lost in registration or re-registration
    }, { timeout, signal })

    const message = assertReturn(array(OrderResponseUnion), coerce(OrderResponseUnion)(response.Snapshot?.Data ?? []))

    return {
      referenceId: response.ReferenceId,
      inactivityTimeout: response.InactivityTimeout,
      message,
    }
  }
}

const unsubscribe: SaxoBankSubscriptionUnsubscribe = async ({ app, contextId, referenceId, timeout, signal }) => {
  await app.portfolio.balances.subscriptions.delete({
    ContextId: contextId,
    ReferenceId: referenceId,
  }, { timeout, signal })
}
