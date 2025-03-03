import { Debug } from '../../../../../utils/debug.ts'
import { describe, expect, test } from '../../../../../utils/testing.ts'
import { InteractiveBrokersClient } from '../../../client.ts'

const debug = Debug('test')

describe('portfolio/accounts', () => {
  test('response passes guard', async () => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    const response = await client.portfolio.accounts.get()
    debug(response)
    expect(response).toBeDefined()
  })
})
