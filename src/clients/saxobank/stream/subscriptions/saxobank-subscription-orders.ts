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
import { mergeDeltaContent } from '../../../../utils/merge-delta-content.ts'
import type { PromiseQueue } from '../../../../utils/promise-queue.ts'
import type { SaxoBankStream } from '../../../saxobank-stream.ts'
import { SaxoBankRandom } from '../../saxobank-random.ts'
import { sanitizeSaxobankValue } from '../../service-group-client/sanitize-saxobank-value.ts'
import type { OpenOrdersRequest } from '../../types/records/open-orders-request.ts'
import { OrderResponseUnion } from '../../types/records/order-response.ts'
import {
  SaxoBankSubscription,
  type SaxoBankSubscriptionCreateReferenceId,
  type SaxoBankSubscriptionParse,
  type SaxoBankSubscriptionSubscribe,
  type SaxoBankSubscriptionUnsubscribe,
} from '../saxobank-subscription.ts'

const Payload = array(props({
  OrderId: string(),
}, { extendable: true }))

const OrderDeletedMessage = props({
  OrderId: string(),
  '__meta_deleted': literal(true),
})

const isOrderDeletedMessage = is(OrderDeletedMessage)

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

const parse: SaxoBankSubscriptionParse<readonly OrderResponseUnion[]> = (previous, rawPayload) => {
  const payload = sanitizeSaxobankValue(rawPayload)
  assert(Payload, payload)

  return [payload.reduce<readonly OrderResponseUnion[]>((orders, message) => {
    const index = orders.findIndex((order) => order.OrderId === message.OrderId)
    const order = orders[index]

    // If we don't know the order by it's ID, we assume it's a new order - and it must pass the order guard
    if (order === undefined) {
      assert(OrderResponseUnion, message)
      return [...orders, message]
    }

    // If we do know the order id, we should check for the the __meta_deleted-property (this happens when the order is filled or cancelled)
    if (isOrderDeletedMessage(message)) {
      return [...orders.slice(0, index), ...orders.slice(index + 1)]
    }

    // If none of the above matches the message, the message must be a update to the order (containing only the changed properties)
    const mergedOrder = mergeDeltaContent(order, message)
    assert(OrderResponseUnion, mergedOrder)
    return [...orders.slice(0, index), mergedOrder, ...orders.slice(index + 1)]
  }, previous)]
}

function createReferenceIdGenerator(options: ArgumentType<OpenOrdersRequest>): SaxoBankSubscriptionCreateReferenceId {
  const accountGroupKey = options.AccountGroupKey === undefined ? undefined : `g${options.AccountGroupKey}`
  const accountKey = options.AccountKey === undefined ? undefined : `a${options.AccountKey}`
  const clientKey = options.ClientKey === undefined ? undefined : `c${options.ClientKey}`

  const infix = [accountGroupKey, accountKey, clientKey]
    .filter((candidate) => candidate !== undefined)
    .join('-')
    .replace(/[^a-zA-Z]/g, 'x')

  return () => SaxoBankRandom.stream.referenceID(`orders-${infix}`)
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

    if (response.Snapshot === undefined) {
      return {
        referenceId: response.ReferenceId,
        inactivityTimeout: response.InactivityTimeout,
        message: [],
      }
    }

    const { __count, __next, Data = [], MaxRows } = response.Snapshot

    if (__next !== undefined) {
      throw new Error(`Expected all data to be delivered in a single snapshot, but got a __next-property`)
    }

    if (__count !== undefined && __count > Data.length) {
      throw new Error(
        `Expected all data to be delivered in a single snapshot, but only got ${Data.length}/${__count} elements`,
      )
    }

    if (__count !== undefined && MaxRows !== undefined && __count > MaxRows) {
      throw new Error(
        `Expected all data to be delivered in a single snapshot, but there are more data available than the MaxRows-property allows (${__count}/${MaxRows})`,
      )
    }

    const message = assertReturn(array(OrderResponseUnion), coerce(OrderResponseUnion)(Data))

    return {
      referenceId: response.ReferenceId,
      inactivityTimeout: response.InactivityTimeout,
      message,
    }
  }
}

const unsubscribe: SaxoBankSubscriptionUnsubscribe = async ({ app, contextId, referenceId, timeout, signal }) => {
  await app.portfolio.orders.subscriptions.delete({
    ContextId: contextId,
    ReferenceId: referenceId,
  }, { timeout, signal })
}
