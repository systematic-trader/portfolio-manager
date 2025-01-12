import { is } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { describe, expect, test } from '../../../../utils/testing.ts'
import { Currency3 } from '../../types/derives/currency.ts'
import { SaxoBankMarketClosedError } from '../errors.ts'
import type { SaxoBankAccount } from '../saxobank-account.ts'
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

describe('transfer', () => {
  test('same currency', async () => {
    const options = await SaxoBankBroker.options({ type: 'Live' })

    const accountID1 = Object.entries(options.accounts).find((entry): entry is [string, 'DKK'] => entry[1] === 'DKK')
      ?.[0]

    if (accountID1 === undefined) {
      throw new Error('No first DKK account found')
    }

    const accountID2 = Object.entries(options.accounts).find((entry): entry is [string, 'DKK'] =>
      entry[0] !== accountID1 && entry[1] === 'DKK'
    )?.[0]

    if (accountID2 === undefined) {
      throw new Error('No second DKK account found')
    }

    await using broker = await SaxoBankBroker({ ...options, accounts: { [accountID1]: 'DKK', [accountID2]: 'DKK' } })

    type Account = SaxoBankAccount<{ accountID: string; currency: 'DKK' }>

    try {
      const account1 = await broker.accounts.get({ ID: accountID1, currency: 'DKK' }) as Account
      const account2 = await broker.accounts.get({ ID: accountID2, currency: 'DKK' }) as Account

      if (account1 === account2) {
        throw new Error('Same account')
      }

      console.log('account1:', account1.cash)
      console.log('account2:', account2.cash)

      const amount = 1

      const order = await account1.transfer({
        amount,
        currency: 'DKK',
        to: account2,
      })

      if (order.session.executable === false) {
        throw new Error('Same currency transfer should always be executable')
      }

      expect(order.from.account).toBe(account1)
      expect(order.from.commission).toBe(0)
      expect(order.from.withdraw).toBe(amount)
      expect(order.to.account).toBe(account2)
      expect(order.to.deposit).toBe(amount)
      expect(order.rate).toBe(1)

      const result = await order.execute()

      expect(result.from.account).toBe(account1)
      expect(result.from.amount).toBe(order.from.withdraw)
      expect(result.from.commission).toBe(0)
      expect(result.to.account).toBe(account2)
      expect(result.to.amount).toBe(order.to.deposit)
      expect(result.rate).toBe(order.rate)
    } finally {
      await broker.dispose()
    }
  })

  test.only('dkk to euro', async () => {
    const options = await SaxoBankBroker.options({ type: 'Live' })

    const accountID1 = Object.entries(options.accounts).find((entry): entry is [string, 'DKK'] => entry[1] === 'DKK')
      ?.[0]

    if (accountID1 === undefined) {
      throw new Error('No DKK account found')
    }

    const accountID2 = Object.entries(options.accounts).find((entry): entry is [string, 'EUR'] =>
      entry[0] !== accountID1 && entry[1] === 'EUR'
    )?.[0]

    if (accountID2 === undefined) {
      throw new Error('No EUR account found')
    }

    await using broker = await SaxoBankBroker({ ...options, accounts: { [accountID1]: 'DKK', [accountID2]: 'EUR' } })

    type Account1 = SaxoBankAccount<{ accountID: string; currency: 'DKK' }>
    type Account2 = SaxoBankAccount<{ accountID: string; currency: 'EUR' }>

    try {
      const account1 = await broker.accounts.get({ ID: accountID1, currency: 'DKK' }) as Account1
      const account2 = await broker.accounts.get({ ID: accountID2, currency: 'EUR' }) as Account2

      if (account1.cash < 2) {
        throw new Error('Insufficient funds')
      }

      const amount = 1

      const order = await account1.transfer({
        amount,
        currency: 'EUR',
        to: account2,
      })

      if (order.session.executable === false) {
        await expect(order.execute()).rejects.toThrow(
          new SaxoBankMarketClosedError('Cross currency transfer not allowed when market is closed'),
        )

        return
      }

      expect(order.from.account).toBe(account1)
      expect(order.from.commission).toBeGreaterThanOrEqual(0)
      expect(order.from.withdraw).toBeGreaterThan(0)
      expect(order.to.account).toBe(account2)
      expect(order.to.deposit).toBe(amount)
      expect(order.rate).toBeGreaterThan(0)

      console.log('order:', order)

      const result = await order.execute()

      console.log('result:', result)
    } finally {
      await broker.dispose()
    }
  })
})
