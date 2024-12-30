import { expect, test } from '../../../../utils/testing.ts'
import { SaxoBankBroker, SaxoBankBrokerOptionsError } from '../saxobank-broker.ts'

test('broker properties', async () => {
  const options = await SaxoBankBroker.options({ type: 'Live' })

  await using broker = await SaxoBankBroker(options)

  expect(broker.currency).toBe(options.currency)
  expect(broker.cash).toBeGreaterThanOrEqual(0)
  expect(Object.keys(broker.margin).toSorted()).toStrictEqual(['available', 'total', 'used', 'utilization'])
  expect(broker.margin.available).toBeGreaterThanOrEqual(0)
  expect(broker.margin.total).toBeGreaterThanOrEqual(0)
  expect(broker.margin.used).toBeGreaterThanOrEqual(0)
  expect(broker.margin.utilization).toBeGreaterThanOrEqual(0)
  expect(Object.keys(broker.positions).toSorted()).toStrictEqual(['unrealized'])
  expect(broker.positions.unrealized).toBeGreaterThanOrEqual(0)
  expect(broker.protectionLimit).toBeGreaterThanOrEqual(0)
  expect(broker.total).toBeGreaterThanOrEqual(0)

  await broker.dispose()
})

test('Invalid broker currency', async () => {
  const options = await SaxoBankBroker.options({ type: 'Live' })

  const otherCurrency = options.currency === 'EUR' ? 'USD' : 'EUR'

  await expect(SaxoBankBroker({ ...options, currency: otherCurrency })).rejects.toThrow(
    new SaxoBankBrokerOptionsError(
      `Broker currency must be set to "${options.currency}" and not "${otherCurrency}"`,
    ),
  )
})

test('Invalid account ID', async () => {
  const options = await SaxoBankBroker.options({ type: 'Live' })

  await expect(SaxoBankBroker({ ...options, accounts: { ABC: 'USD' } })).rejects.toThrow(
    new SaxoBankBrokerOptionsError(
      `Broker account unknown: "ABC"`,
    ),
  )
})

test('Invalid account currency', async () => {
  const options = await SaxoBankBroker.options({ type: 'Live' })

  const firstEntry = Object.entries(options.accounts)[0]!

  const firstEntryCurrency = firstEntry[1]

  firstEntry[1] = firstEntryCurrency === 'EUR' ? 'USD' : 'EUR'

  const acccountsWithInvalidCurrency = Object.fromEntries([firstEntry])

  await expect(SaxoBankBroker({ ...options, accounts: acccountsWithInvalidCurrency })).rejects
    .toThrow(
      new SaxoBankBrokerOptionsError(
        `Broker account "${firstEntry[0]}" currency must be set to "${firstEntryCurrency}" and not "${firstEntry[1]}"`,
      ),
    )
})
