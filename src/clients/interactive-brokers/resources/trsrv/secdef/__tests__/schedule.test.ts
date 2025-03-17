import { Debug } from '../../../../../../utils/debug.ts'
import { extractEntries } from '../../../../../../utils/object.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { InteractiveBrokersClient } from '../../../../client.ts'

const debug = Debug('test')

const CONTRACTS = {
  STK: [
    'IWDA', // 100292038
    'NOVO.B', // 652806383
    'TL0', // 78046366
    'AAPL', // 265598
    'TSLA', // 76792991
  ],

  // CASH: [
  //   'EUR_FUT', // 427143829
  //   'EUR_CASH', // 12087792

  //   'DKK.SEK', // 28027110
  //   'DKK.JPY', // 110616600
  //   'DKK.NOK', // 110616599
  // ],

  BND: [
    // "US-T Govt Bond STRIPS Interest 0.0 May15'48", // 317483224
  ],
} as const

describe('trsrv/secdef/schedule', () => {
  test('response matches guard', async ({ step }) => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    for (const [assetClass, symbols] of extractEntries(CONTRACTS)) {
      await step(assetClass, async ({ step }) => {
        for (const symbol of symbols) {
          await step(symbol, async () => {
            const response = await client.trsrv.secdef.schedule.get({
              assetClass,
              symbol,
            })

            debug(response)
            expect(response).toBeDefined()
          })
        }
      })
    }
  })
})
