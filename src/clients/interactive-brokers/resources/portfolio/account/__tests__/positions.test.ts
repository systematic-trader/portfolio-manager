import { Debug } from '../../../../../../utils/debug.ts'
import { Environment } from '../../../../../../utils/environment.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { InteractiveBrokersClient } from '../../../../client.ts'

const debug = Debug('test')

describe('portfolio/account/positions', () => {
  test('response passes guard', async () => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })
    const accountId = Environment.get('IB_PAPER_ACCOUNT_ID')

    const invalidateResponse = await client.portfolio.account.positions.invalidate.post({
      accountId,
    })
    debug(invalidateResponse)
    expect(invalidateResponse).toBeDefined()

    const response1 = await client.portfolio.account.positions.get({
      accountId,
    })
    debug('response1', response1)

    const response2 = await client.portfolio.account.positions.get({
      accountId,
    })
    debug('response2', response2)

    expect(response2).toBeDefined()
  })
})
