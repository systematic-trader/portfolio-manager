import { Debug } from '../../../../../utils/debug.ts'
import { describe, expect, test } from '../../../../../utils/testing.ts'
import { InteractiveBrokersClient } from '../../../client.ts'

const debug = Debug('test')

describe('trsrv/all-conids', () => {
  test('response passes guard', async () => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    const bonds = await client.trsrv.allConids.get({
      assetClass: 'STK',
      exchange: 'NYSE',
    })

    debug('bonds', bonds)
    expect(bonds).toBeDefined()
  })
})
