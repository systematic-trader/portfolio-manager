import { is } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { expect, test } from '../../../../utils/testing.ts'
import { Currency3 } from '../../types/derives/currency.ts'
import { SaxoBankBroker } from '../saxobank-broker.ts'

test('account properties', async () => {
  await using broker = await SaxoBankBroker(await SaxoBankBroker.options({ type: 'Live' }))

  try {
    expect(Object.keys(broker.accounts).length).toBeGreaterThan(0)

    for (const [ID, account] of Object.entries(broker.accounts)) {
      expect(account.ID).toBe(ID)
      expect(is(Currency3)(account.currency)).toBe(true)
      expect(account.cash).toBeGreaterThanOrEqual(0)
      expect(account.total).toBeGreaterThanOrEqual(0)
      expect(account.margin.available).toBeGreaterThanOrEqual(0)
      expect(account.margin.used).toBeGreaterThanOrEqual(0)
      expect(account.margin.total).toBeGreaterThanOrEqual(0)
      expect(account.margin.utilization).toBeGreaterThanOrEqual(0)
    }
  } finally {
    await broker.dispose()
  }
})
