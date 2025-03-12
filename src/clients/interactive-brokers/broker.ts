import { ensureError } from '../../utils/error.ts'
import { Timeout } from '../../utils/timeout.ts'
import { InteractiveBrokersClient } from './client.ts'
import { InteractiveBrokersStream } from './stream.ts'

export interface InteractiveBrokers {
}

export async function InteractiveBrokers<Type extends 'Live' | 'Paper'>(
  options: { readonly type: Type; readonly marketData: Record<string, ReadonlyArray<number>> },
): Promise<{ readonly broker: InteractiveBrokers; refresh(): Promise<void>; dispose(): Promise<void> }> {
  const client = new InteractiveBrokersClient(options)
  const stream = await InteractiveBrokersStream({
    client,
    marketData: options.marketData,
  })

  let accounts = structuredClone(stream.accounts)
  let marketData = structuredClone(stream.marketData)
  let orders = structuredClone(stream.orders)

  const orderDrafts = new Map<
    /* contract ID */ number,
    { asset: 'Stock'; type: 'Market'; quantity: number; contractID: number; orderID: number; side: 'BUY' | 'SELL' }
  >()

  let orderCounter = 0

  const broker = {
    buy(order: { asset: 'Stock'; type: 'Market'; quantity: number; contractID: number }): number {
      if (orderDrafts.has(order.contractID)) {
        throw new Error('Order already exists')
      }

      orderCounter++

      const orderID = orderCounter

      orderDrafts.set(order.contractID, { ...order, orderID, side: 'BUY' })

      return orderID
    },

    cancel(orderID: number): boolean {
      for (const draft of orderDrafts.values()) {
        if (draft.orderID === orderID) {
          orderDrafts.delete(draft.contractID)
          return true
        }
      }

      return false
    },
  }

  async function dispose(): Promise<void> {
    let caughtError: undefined | Error = undefined

    try {
      await stream.dispose()
    } catch (error) {
      caughtError = ensureError(error)
    }

    try {
      await client.dispose()
    } catch (error) {
      if (caughtError === undefined) {
        caughtError = ensureError(error)
      }
    }
  }

  async function refresh(): Promise<void> {
    const orderIDs = await Promise.allSettled(
      // We ignore IBKR's request rate limit, since it seems to be a soft limit
      orderDrafts.values().map(async (draft) => {
        const [{ order_id }] = await client.iserver.account.orders.post({
          orders: [
            {
              conidex: `${draft.contractID}@SMART`,
              manualIndicator: false,
              orderType: 'MKT',
              side: draft.side,
              tif: 'DAY',
              quantity: draft.quantity,
              cOID: `systematic-order-${draft.orderID}`,
            },
          ],
        })

        const orderId = Number(order_id)

        if (Number.isSafeInteger(orderId) === false || orderId.toString() !== order_id) {
          throw new Error('Invalid order ID')
        }
        return orderId
      }),
    ).then((results) => {
      const orderIDs = new Set<number>()

      for (const result of results) {
        if (result.status === 'rejected') {
          throw result.reason
        }

        if (orderIDs.has(result.value)) {
          throw new Error('Order ID collision')
        }

        orderIDs.add(result.value)
      }

      return orderIDs
    })

    const now = Date.now()
    const timeout = 10_000 // ms

    while (true) {
      for (const order of stream.orders.values()) {
        orderIDs.delete(order.orderId)
      }

      if (orderIDs.size === 0 || Date.now() - now > timeout) {
        break
      }

      await Timeout.wait(100)
    }

    if (orderIDs.size !== 0) {
      throw new Error('Some orders were not found')
    }

    accounts = structuredClone(stream.accounts)
    marketData = structuredClone(stream.marketData)
    orders = structuredClone(stream.orders)
  }

  return { broker, dispose, refresh }
}
