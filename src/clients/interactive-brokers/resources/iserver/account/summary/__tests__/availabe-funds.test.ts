import { Debug } from '../../../../../../../utils/debug.ts'
import { describe, expect, test } from '../../../../../../../utils/testing.ts'
import { InteractiveBrokersClient } from '../../../../../client.ts'

const debug = Debug('test')

describe('iserver/account/summary/available-funds', () => {
  test('response passes guard', async () => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    const response = await client.iserver.account.summary.availableFunds.get()
    expect(response).toBeDefined()
    debug('response', response)
  })
})
