import { Debug } from '../../../../../../../utils/debug.ts'
import { describe, expect, test } from '../../../../../../../utils/testing.ts'
import { InteractiveBrokersClient } from '../../../../../client.ts'

const debug = Debug('test')

const CONTRACTS = {
  'AAPL': 265598,
  'ESZ5': 495512563, // expiration 2025-12-19
}

describe('iserver/account/orders/whattif', () => {
  test('response matches guard', async ({ step }) => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    for (const [symbol, conid] of Object.entries(CONTRACTS)) {
      await step(symbol, async () => {
        const response = await client.iserver.account.orders.whatIf.post({
          conid,
        })

        debug(response)
        expect(response).toBeDefined()
      })
    }
  })
})
