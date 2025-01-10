import { is } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { expect, test } from '../../../../utils/testing.ts'
import { Currency3 } from '../../types/derives/currency.ts'
import { SaxoBankBroker } from '../saxobank-broker.ts'

test('account properties', async () => {
  const options = await SaxoBankBroker.options({ type: 'Live' })
  await using broker = await SaxoBankBroker(options)

  try {
    const loadedAccounts = Object.keys(options.accounts).length

    expect(loadedAccounts).toBeGreaterThan(0)

    let loaded = 0

    for (const [ID, currency] of Object.entries(options.accounts)) {
      const account = await broker.accounts.get({ ID, currency })

      if (account === undefined) {
        throw new Error(`Account not found: ${ID}`)
      }

      expect(broker.accounts[ID]).toBe(account)

      expect(account.ID).toBe(ID)
      expect(is(Currency3)(account.currency)).toBe(true)
      expect(account.cash).toBeGreaterThanOrEqual(0)
      expect(account.total).toBeGreaterThanOrEqual(0)
      expect(account.margin.available).toBeGreaterThanOrEqual(0)
      expect(account.margin.used).toBeGreaterThanOrEqual(0)
      expect(account.margin.total).toBeGreaterThanOrEqual(0)
      expect(account.margin.utilization).toBeGreaterThanOrEqual(0)

      loaded++
    }

    expect(loaded).toBe(loadedAccounts)
  } finally {
    await broker.dispose()
  }
})
