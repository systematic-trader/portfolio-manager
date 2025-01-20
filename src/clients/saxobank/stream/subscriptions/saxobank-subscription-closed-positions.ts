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
import { ClosedPositionResponseUnion } from '../../types/records/closed-position-response.ts'
import type { ClosedPositionsRequest } from '../../types/records/closed-positions-request.ts'
import {
  SaxoBankSubscription,
  type SaxoBankSubscriptionCreateReferenceId,
  type SaxoBankSubscriptionParse,
  type SaxoBankSubscriptionSubscribe,
  type SaxoBankSubscriptionUnsubscribe,
} from '../saxobank-subscription.ts'

const Payload = array(props({
  ClosedPositionUniqueId: string(),
}, { extendable: true }))

const ClosedPositionDeletedMessage = props({
  ClosedPositionUniqueId: string(),
  '__meta_deleted': literal(true),
})

const isClosedPositionDeletedMessage = is(ClosedPositionDeletedMessage)

export class SaxoBankSubscriptionClosedPositions extends SaxoBankSubscription<readonly ClosedPositionResponseUnion[]> {
  readonly options: ClosedPositionsRequest

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
    readonly options: ArgumentType<ClosedPositionsRequest>
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

    this.options = options as ClosedPositionsRequest
  }
}

const parse: SaxoBankSubscriptionParse<readonly ClosedPositionResponseUnion[]> = (previous, rawPayload) => {
  const payload = sanitizeSaxobankValue(rawPayload)
  assert(Payload, payload)

  return [payload.reduce<readonly ClosedPositionResponseUnion[]>((closedPositions, message) => {
    const index = closedPositions.findIndex((closedPosition) =>
      closedPosition.ClosedPositionUniqueId === message.ClosedPositionUniqueId
    )
    const position = closedPositions[index]

    // If we don't know the position by it's ID, we assume it's a new position - and it must pass the position guard
    if (position === undefined) {
      assert(ClosedPositionResponseUnion, message)
      return [...closedPositions, message]
    }

    // If we do know the position id, we should check for the the __meta_deleted-property (this happens when the position is filled or cancelled)
    if (isClosedPositionDeletedMessage(message)) {
      return [...closedPositions.slice(0, index), ...closedPositions.slice(index + 1)]
    }

    // If none of the above matches the message, the message must be a update to the position (containing only the changed properties)
    const mergedPosition = mergeDeltaContent(position, message)
    assert(ClosedPositionResponseUnion, mergedPosition)
    return [...closedPositions.slice(0, index), mergedPosition, ...closedPositions.slice(index + 1)]
  }, previous)]
}

function createReferenceIdGenerator(
  options: ArgumentType<ClosedPositionsRequest>,
): SaxoBankSubscriptionCreateReferenceId {
  const accountGroupKey = options.AccountGroupKey === undefined ? undefined : `g${options.AccountGroupKey}`
  const accountKey = options.AccountKey === undefined ? undefined : `a${options.AccountKey}`
  const clientKey = options.ClientKey === undefined ? undefined : `c${options.ClientKey}`

  const infix = [accountGroupKey, accountKey, clientKey]
    .filter((candidate) => candidate !== undefined)
    .join('-')
    .replace(/[^a-zA-Z]/g, 'x')

  return () => SaxoBankRandom.stream.referenceID(`closed-positions-${infix}`)
}

function createSubscribe(
  options: ArgumentType<ClosedPositionsRequest>,
): SaxoBankSubscriptionSubscribe<readonly ClosedPositionResponseUnion[]> {
  return async function subscribe({ app, contextId, referenceId, previousReferenceId, timeout, signal }): Promise<{
    readonly referenceId: string
    readonly message: readonly ClosedPositionResponseUnion[]
    readonly inactivityTimeout: number
  }> {
    const response = await app.portfolio.closedPositions.subscriptions.post({
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

    const message = assertReturn(array(ClosedPositionResponseUnion), coerce(ClosedPositionResponseUnion)(Data))

    return {
      referenceId: response.ReferenceId,
      inactivityTimeout: response.InactivityTimeout,
      message,
    }
  }
}

const unsubscribe: SaxoBankSubscriptionUnsubscribe = async ({ app, contextId, referenceId, timeout, signal }) => {
  await app.portfolio.positions.subscriptions.delete({
    ContextId: contextId,
    ReferenceId: referenceId,
  }, { timeout, signal })
}
