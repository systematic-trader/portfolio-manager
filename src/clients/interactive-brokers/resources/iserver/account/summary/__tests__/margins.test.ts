import { Debug } from '../../../../../../../utils/debug.ts'
import { describe, expect, test } from '../../../../../../../utils/testing.ts'
import { InteractiveBrokersClient } from '../../../../../client.ts'

const debug = Debug('test')

describe('iserver/account/summary/margins', () => {
  test('response passes guard', async () => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    const response = await client.iserver.account.summary.margins.get()
    expect(response).toBeDefined()
    debug('response', response)
  })
})
