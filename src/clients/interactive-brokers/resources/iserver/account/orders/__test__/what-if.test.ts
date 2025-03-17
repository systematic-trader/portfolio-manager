import { Debug } from '../../../../../../../utils/debug.ts'
import { describe, expect, test } from '../../../../../../../utils/testing.ts'
import { InteractiveBrokersClient } from '../../../../../client.ts'

const debug = Debug('test')

const CONTRACTS = {
  'AAPL': 265598,
  // 'ESZ5': 495512563, // expiration 2025-12-19
  // 'M6A': 748353593, // expiration 2025-06-16
}

describe('iserver/account/orders/whattif', () => {
  test('response matches guard', async ({ step }) => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    for (const [symbol, conid] of Object.entries(CONTRACTS)) {
      await step(symbol, async () => {
        const buyResponse = await client.iserver.account.orders.whatIf.post({
          conid,
          side: 'BUY',
        })

        debug('buy', buyResponse)
        expect(buyResponse).toBeDefined()

        const sellResponse = await client.iserver.account.orders.whatIf.post({
          conid,
          side: 'SELL',
        })

        debug('sell', sellResponse)
        expect(sellResponse).toBeDefined()

        const marginResponse = await client.iserver.account.orders.whatIf.margin({
          conid,
        })

        debug('margin', marginResponse)
        expect(marginResponse).toBeDefined
      })
    }
  })
})
