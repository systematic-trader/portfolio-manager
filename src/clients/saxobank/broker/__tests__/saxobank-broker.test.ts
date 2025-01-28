import { toArray } from '../../../../utils/async-iterable.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../saxobank-application.ts'
import { TestingUtilities } from '../../__tests__/testing-utilities.ts'
import { QuoteKnown } from '../../types/records/quote.ts'
import { SaxoBankAccountCurrencyMismatchError, SaxoBankDefaultCurrencyMismatchError } from '../errors.ts'
import { SaxoBankBroker } from '../saxobank-broker.ts'
import type { SaxoBankStockOrderOptions } from '../saxobank-stock.ts'

test('broker properties', async () => {
  const options = await SaxoBankBroker.options({ type: 'Live' })

  // const oneAccount = Object.fromEntries([Object.entries(options.accounts)[0]!])

  await using broker = await SaxoBankBroker({ ...options })

  expect(broker.currency).toBe(options.currency)
  expect(broker.cash).toBeGreaterThanOrEqual(0)
  expect(Object.keys(broker.margin).toSorted()).toStrictEqual(['available', 'total', 'used', 'utilization'])
  expect(broker.margin.available).toBeGreaterThanOrEqual(0)
  expect(broker.margin.total).toBeGreaterThanOrEqual(0)
  expect(broker.margin.used).toBeGreaterThanOrEqual(0)
  expect(broker.margin.utilization).toBeGreaterThanOrEqual(0)
  expect(Object.keys(broker.positions).toSorted()).toStrictEqual(['unrealized'])
  expect(broker.positions.unrealized).toBeGreaterThanOrEqual(0)
  expect(broker.total).toBeGreaterThanOrEqual(0)

  await broker.dispose()
})

test('Invalid broker currency', async () => {
  const options = await SaxoBankBroker.options({ type: 'Live' })

  const otherCurrency = options.currency === 'EUR' ? 'USD' : 'EUR'

  await expect(SaxoBankBroker({ ...options, currency: otherCurrency })).rejects.toThrow(
    new SaxoBankDefaultCurrencyMismatchError(otherCurrency, options.currency),
  )
})

test('Invalid account ID', async () => {
  const options = await SaxoBankBroker.options({ type: 'Live' })

  await expect(SaxoBankBroker({ ...options, accounts: { ABC: 'USD' } })).rejects.toThrow(
    `"ABC"`,
  )
})

test('Invalid account currency', async () => {
  const options = await SaxoBankBroker.options({ type: 'Live' })

  const firstEntry = Object.entries(options.accounts)[0]!

  const firstEntryCurrency = firstEntry[1]

  firstEntry[1] = firstEntryCurrency === 'EUR' ? 'USD' : 'EUR'

  const acccountsWithInvalidCurrency = Object.fromEntries([firstEntry])

  const accountID = firstEntry[0]
  const actualCurrency = firstEntryCurrency
  const expectedCurrency = firstEntry[1]

  await expect(SaxoBankBroker({ ...options, accounts: acccountsWithInvalidCurrency })).rejects
    .toThrow(new SaxoBankAccountCurrencyMismatchError(accountID, expectedCurrency, actualCurrency))
})

describe('placing buy orders', () => {
  using app = new SaxoBankApplication({ type: 'Simulation' })

  const {
    getFirstAccount,
    resetSimulationAccount,
    calculateFavourableOrderPrice,
  } = new TestingUtilities({ app })

  beforeEach(resetSimulationAccount)
  afterAll(resetSimulationAccount)

  const orderTypes: SaxoBankStockOrderOptions['type'][] = [
    'Market',
    'Limit',
    'Stop',
    'StopLimit',
    'TrailingStop',
  ]

  test('for stock', async ({ step }) => {
    for (const orderType of orderTypes) {
      const options = await SaxoBankBroker.options({ type: 'Simulation' })

      const saxoAccount = await getFirstAccount()

      const tesla = { symbol: 'TL0:XETR', uic: 692462 } as const

      const [teslaSaxoInstrument] = await toArray(app.referenceData.instruments.details.get({
        AssetTypes: ['Stock'],
        Uics: [tesla.uic],
      }))

      expect(teslaSaxoInstrument).toBeDefined()
      if (teslaSaxoInstrument === undefined) {
        return
      }

      const { Quote: quote } = await app.trading.infoPrices.get({
        AssetType: teslaSaxoInstrument.AssetType,
        Uic: teslaSaxoInstrument.Uic,
      })

      if (QuoteKnown.accept(quote) === false) {
        throw new Error('Unknown quote')
      }

      await step(orderType, async () => {
        await resetSimulationAccount()

        await using broker = await SaxoBankBroker(options)
        const account = await broker.accounts.get({ ID: saxoAccount.AccountId, currency: 'EUR' })

        expect(account).toBeDefined()
        if (account === undefined) {
          return
        }

        const teslaStock = await account.stock(tesla.symbol)

        switch (orderType) {
          case 'Market': {
            const order = teslaStock.buy({
              type: 'Market',
              quantity: 1,
              duration: 'Day',
            })

            const result = await order.execute()
            expect(result).toBeDefined()

            break
          }

          case 'Limit': {
            const { orderPrice: limit } = calculateFavourableOrderPrice({
              buySell: 'Buy',
              orderType: 'Limit',
              instrument: teslaSaxoInstrument,
              quote,
            })

            const order = teslaStock.buy({
              type: 'Limit',
              quantity: 1,
              duration: 'Day',
              limit,
            })

            const result = await order.execute()
            expect(result).toBeDefined()

            break
          }

          case 'Stop': {
            const { orderPrice: stop } = calculateFavourableOrderPrice({
              buySell: 'Buy',
              orderType: 'Stop',
              instrument: teslaSaxoInstrument,
              quote,
            })

            const order = teslaStock.buy({
              type: 'Stop',
              quantity: 1,
              duration: 'Day',
              stop,
            })

            const result = await order.execute()
            expect(result).toBeDefined()

            break
          }

          case 'StopLimit': {
            const { orderPrice: stop, stopLimitPrice: limit } = calculateFavourableOrderPrice({
              buySell: 'Buy',
              orderType: 'StopLimit',
              instrument: teslaSaxoInstrument,
              quote,
            })

            const order = teslaStock.buy({
              type: 'StopLimit',
              quantity: 1,
              duration: 'Day',
              stop,
              limit,
            })

            const result = await order.execute()
            expect(result).toBeDefined()

            break
          }

          case 'TrailingStop': {
            const { orderPrice: stop } = calculateFavourableOrderPrice({
              buySell: 'Buy',
              orderType: 'TrailingStop',
              instrument: teslaSaxoInstrument,
              quote,
            })

            const order = teslaStock.buy({
              type: 'TrailingStop',
              quantity: 1,
              duration: 'Day',
              stop,
              marketOffset: 10,
              stepAmount: 1,
            })

            const result = await order.execute()
            expect(result).toBeDefined()

            break
          }
        }
      })
    }
  })

  test('for etf', async ({ step }) => {
    for (const orderType of orderTypes) {
      const options = await SaxoBankBroker.options({ type: 'Simulation' })

      const saxoAccount = await getFirstAccount()

      const eunl = { symbol: 'EUNL:XETR', uic: 113771 } as const

      const [eunlInstrument] = await toArray(app.referenceData.instruments.details.get({
        AssetTypes: ['Etf'],
        Uics: [eunl.uic],
      }))

      expect(eunlInstrument).toBeDefined()
      if (eunlInstrument === undefined) {
        return
      }

      const { Quote: quote } = await app.trading.infoPrices.get({
        AssetType: eunlInstrument.AssetType,
        Uic: eunlInstrument.Uic,
      })

      if (QuoteKnown.accept(quote) === false) {
        throw new Error('Unknown quote')
      }

      await step(orderType, async () => {
        await resetSimulationAccount()

        await using broker = await SaxoBankBroker(options)
        const account = await broker.accounts.get({ ID: saxoAccount.AccountId, currency: 'EUR' })

        expect(account).toBeDefined()
        if (account === undefined) {
          return
        }

        const eunlETF = await account.etf(eunl.symbol)

        switch (orderType) {
          case 'Market': {
            const order = eunlETF.buy({
              type: 'Market',
              quantity: 1,
              duration: 'Day',
            })

            const result = await order.execute()
            expect(result).toBeDefined()

            break
          }

          case 'Limit': {
            const { orderPrice: limit } = calculateFavourableOrderPrice({
              buySell: 'Buy',
              orderType: 'Limit',
              instrument: eunlInstrument,
              quote,
            })

            const order = eunlETF.buy({
              type: 'Limit',
              quantity: 1,
              duration: 'Day',
              limit,
            })

            const result = await order.execute()
            expect(result).toBeDefined()

            break
          }

          case 'Stop': {
            const { orderPrice: stop } = calculateFavourableOrderPrice({
              buySell: 'Buy',
              orderType: 'Stop',
              instrument: eunlInstrument,
              quote,
            })

            const order = eunlETF.buy({
              type: 'Stop',
              quantity: 1,
              duration: 'Day',
              stop,
            })

            const result = await order.execute()
            expect(result).toBeDefined()

            break
          }

          case 'StopLimit': {
            const { orderPrice: stop, stopLimitPrice: limit } = calculateFavourableOrderPrice({
              buySell: 'Buy',
              orderType: 'StopLimit',
              instrument: eunlInstrument,
              quote,
            })

            const order = eunlETF.buy({
              type: 'StopLimit',
              quantity: 1,
              duration: 'Day',
              stop,
              limit,
            })

            const result = await order.execute()
            expect(result).toBeDefined()

            break
          }

          case 'TrailingStop': {
            const { orderPrice: stop } = calculateFavourableOrderPrice({
              buySell: 'Buy',
              orderType: 'TrailingStop',
              instrument: eunlInstrument,
              quote,
            })

            const order = eunlETF.buy({
              type: 'TrailingStop',
              quantity: 1,
              duration: 'Day',
              stop,
              marketOffset: 10,
              stepAmount: 1,
            })

            const result = await order.execute()
            expect(result).toBeDefined()

            break
          }
        }
      })
    }
  })
})
