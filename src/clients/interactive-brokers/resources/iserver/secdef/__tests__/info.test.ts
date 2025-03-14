import { Debug } from '../../../../../../utils/debug.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { InteractiveBrokersClient } from '../../../../client.ts'

const CONTRACTS = {
  'EUR.USD_CASH': 12087792,
}

const debug = Debug('test')

describe('iserver/secdef/info', () => {
  test('response passes guard', async ({ step }) => {
    await using client = new InteractiveBrokersClient({ type: 'Paper' })

    const searchResults = await client.iserver.secdef.search.post({
      // symbol: `EUR:${CONTRACTS['EUR.USD_CASH']}`,
      // more: true,
      // or maybe just:
      symbol: 'EUR',
      name: false,
    })

    debug('searchResults', searchResults)
    expect(searchResults).toBeDefined()

    const futureSection = searchResults
      .find((search) => search.conid === CONTRACTS['EUR.USD_CASH'].toString())
      ?.sections?.find((section) => section.secType === 'FUT')

    debug('futureSection', futureSection)
    expect(futureSection).toBeDefined()
    if (futureSection === undefined) {
      throw new Error("Couldn't find future section in search results")
    }

    const months = futureSection.months.split(';')

    for (const month of months) {
      await step(month, async () => {
        // It's possible to find specific future contracts by looking them up by "month"
        // However, testing has revealed that this is not the best way of doing it
        // Specifying the "month" for secdef.info requires the exchange to be specified as well
        // Furthermore, the response structure changes when specifying month
        // The code below is tested, and working, but does not work with the current response guard for secdef.info
        // Instead use trsrv.futures.get to find future contracts by symbol

        // const secdef = await client.iserver.secdef.info.get({
        //   conid: CONTRACTS['EUR.USD_CASH'],
        //   secType: futureSection.secType,
        //   month: month,
        //   exchange: futureSection.exchange,
        // })

        // debug(month, 'secdef', secdef)
        // expect(secdef).toBeDefined()

        // const contract = await client.iserver.contract.info.get({
        //   conid: secdef[0]!.conid,
        // })

        // debug(month, 'contract', contract)
        // expect(contract).toBeDefined()
      })

      break
    }
  })
})
