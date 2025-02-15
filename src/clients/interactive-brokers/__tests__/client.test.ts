import { Debug } from '../../../utils/debug.ts'
import { describe, expect, test } from '../../../utils/testing.ts'
import { InteractiveBrokersClient } from '../client.ts'

const debug = Debug('test')

describe('Interactive Brokers Client', () => {
  test('post', async () => {
    await using client = new InteractiveBrokersClient({ type: 'Live' })

    // Authorization status
    // const status = await client.get({
    //   path: 'v1/api/iserver/auth/status',
    // })
    // debug('status', status)

    const contracts = await client.get({
      path: 'v1/api/trsrv/all-conids',
      searchParams: {
        exchange: 'IBIS',
      },
    })
    debug('contracts', contracts)

    // Search for contracts by symbol
    // const contracts = await client.get({
    //   path: 'v1/api/iserver/secdef/search',
    //   searchParams: {
    //     symbol: 'AAPL',
    //   },
    // })
    // debug('contracts', contracts)

    // const accounts = await client.get({
    //   path: 'v1/api//iserver/accounts',
    // })
    // debug('accounts', accounts)

    // const contract = await client.get({
    //   path: 'v1/api/iserver/contract/100292038/info',
    // })
    // debug('contract', contract)

    // const marketData = await client.get({
    //   path: 'v1/api/iserver/marketdata/snapshot',
    //   searchParams: {
    //     conids: [265598], // Apple
    //     fields: [84, 86],
    //   },
    // })
    // debug('marketData', marketData)

    expect(1).toBe(1)
  })
})
