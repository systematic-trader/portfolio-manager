import { Debug } from '../../../../../../utils/debug.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { InteractiveBrokersClient } from '../../../../client.ts'

const debug = Debug('test')

const CONTRACTS = {
  'EUR_FUT': 427143829,
  'EUR_CASH': 12087792,
  'IWDA': 100292038,
  'AAPL': 265598,
  'TSLA': 76792991,
  'NOVO.B': 652806383,
  'TL0': 78046366,
  'DKK.SEK': 28027110,
  'DKK.JPY': 110616600,
  'DKK.NOK': 110616599,
  "US-T Govt Bond STRIPS Interest 0.0 May15'48": 317483224,
}

describe('iserver/contract/info-and-rules', () => {
  test('response matches guard', async ({ step }) => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    for (const [key, contractId] of Object.entries(CONTRACTS)) {
      await step(key, async () => {
        const response = await client.iserver.contract.infoAndRules.get({
          conid: contractId,
        })

        debug(response)
        expect(response).toBeDefined()
      })
    }
  })
})
