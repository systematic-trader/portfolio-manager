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

import type { BalanceRequest } from '../../types/records/balance-request.ts'
import { BalanceResponse } from '../../types/records/balance-response.ts'
import {
  SaxoBankSubscription,
  type SaxoBankSubscriptionCreateReferenceId,
  type SaxoBankSubscriptionParse,
  type SaxoBankSubscriptionSubscribe,
  type SaxoBankSubscriptionUnsubscribe,
} from '../saxobank-subscription.ts'

const Payload = props({}, { extendable: true })

interface Payload extends GuardType<typeof Payload> {}

export class SaxoBankSubscriptionBalance extends SaxoBankSubscription<BalanceResponse> {
  readonly options: ArgumentType<BalanceRequest>

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
    readonly options: ArgumentType<BalanceRequest>
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

    this.options = options
  }
}

const parse: SaxoBankSubscriptionParse<BalanceResponse> = (previous, payload) => {
  assert(Payload, payload)

  const merged = mergeDeltaCompressedValue(previous, payload)

  assert(BalanceResponse, merged)

  return [merged]
}

function createReferenceIdGenerator(options: ArgumentType<BalanceRequest>): SaxoBankSubscriptionCreateReferenceId {
  const accountGroupKey = options.AccountGroupKey === undefined ? undefined : `g${options.AccountGroupKey}`
  const accountKey = options.AccountKey === undefined ? undefined : `a${options.AccountKey}`
  const clientKey = options.ClientKey === undefined ? undefined : `c${options.ClientKey}`

  const infix = [accountGroupKey, accountKey, clientKey]
    .filter((candidate) => candidate !== undefined)
    .join('-')
    .replace(/[^a-zA-Z]/g, 'x')

  return () => SaxoBankRandom.stream.referenceId(`balance-${infix}`)
}

function createSubscribe(
  options: ArgumentType<BalanceRequest>,
): SaxoBankSubscriptionSubscribe<BalanceResponse> {
  return async function subscribe({ app, contextId, referenceId, previousReferenceId, timeout, signal }): Promise<{
    referenceId: string
    inactivityTimeout: number
    message: BalanceResponse
  }> {
    const response = await app.portfolio.balances.subscriptions.post({
      Arguments: options,
      ContextId: contextId,
      ReferenceId: referenceId,
      ReplaceReferenceId: previousReferenceId,
      Format: 'application/json',
      RefreshRate: 1000,
      Tag: referenceId, // Used to identify the subscription in the WebSocket messages, if the subscription is somehow lost in registration or re-registration
    }, { timeout, signal })

    const message = assertReturn(
      BalanceResponse,
      coerce(BalanceResponse)(response.Snapshot),
    )

    return {
      referenceId: response.ReferenceId,
      inactivityTimeout: response.InactivityTimeout * 1000,
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
