import { describe, expect, test } from '../../../../utils/testing.ts'
import { HTTPClientError } from '../../../http-client.ts'
import { SaxoBankApplication } from '../../../saxobank-application.ts'
import { TestingUtilities } from '../../__tests__/testing-utilities.ts'
import { SaxoBankRandom } from '../../saxobank-random.ts'
import { SaxoBankBroker } from '../saxobank-broker.ts'
import { SaxoBankStock } from '../saxobank-stock.ts'

test('config', () => {
  const config = SaxoBankStock.config('USD', 'AAPL:XNAS')

  expect(config).toBeDefined()
})

test.only('cost', async () => {
  const options = await SaxoBankBroker.options({ type: 'Simulation' })
  await using broker = await SaxoBankBroker(options)
  const account = (await broker.accounts.get({ ID: Object.keys(options.accounts)[0]!, currency: 'EUR' }))!
  const apple = await account.stock('SIE:XETR')
  const order = apple.buy({ type: 'Market', quantity: 1, duration: 'Day' })
  const cost = await order.cost()

  console.log(cost)

  expect(cost).toBeDefined()
})

describe('placing invalid orders', () => {
  using app = new SaxoBankApplication({
    type: 'Simulation',
  })

  const {
    roundPriceToInstrumentSpecification,
    resetSimulationAccount,
    findTradableInstruments,
    calculateMinimumTradeSize,
    waitForPortfolioState,
  } = new TestingUtilities({ app })

  test('placing orders below minimum order value', async ({ step }) => {
    const instruments = findTradableInstruments({
      assetType: 'Stock',
      sessions: ['AutomatedTrading'], // We need our entry orders to be filled to test if we can exit a position below the minimum order size
      uics: [], // I've previously used 41509
    })

    let count = 0
    for await (const { instrument, quote } of instruments) {
      // Disregard any instrument that does not have a minimum order value
      if (instrument.MinimumOrderValue === undefined) {
        continue
      }

      const minimumTradeSize = calculateMinimumTradeSize(instrument)

      // To continue the test, we look for an instrument with trade size 1
      // This way, we can better control how entry and exit orders are placed
      if (minimumTradeSize !== 1) {
        continue
      }

      // We should also make sure that the bid price is well below the minimum order value
      // Otherwise, we cannot place an order that is below the minimum order value
      if (quote.Bid * 0.9 >= instrument.MinimumOrderValue) {
        continue
      }

      await resetSimulationAccount()

      const { price: limitPrice } = roundPriceToInstrumentSpecification({ instrument, price: quote.Bid * 1.1 })
      const quantityToGetAboveMinimumOrderValue = Math.ceil(
        instrument.MinimumOrderValue / limitPrice / (instrument.PriceToContractFactor ?? 1),
      )

      await step(`${instrument.Description} (UIC ${instrument.Uic})`, async ({ step }) => {
        count++

        await step('Placing an entry order with less than the minimum order value', async () => {
          const externalReference = SaxoBankRandom.orderID()

          try {
            await app.trading.orders.post({
              RequestId: SaxoBankRandom.requestID(),
              AssetType: instrument.AssetType,
              Uic: instrument.Uic,
              BuySell: 'Buy',
              Amount: 1, // If we just place an order for 1 unit, we know we're below the minimum order value
              ManualOrder: false,
              ExternalReference: externalReference,
              OrderType: 'Limit',
              OrderPrice: limitPrice,
              OrderDuration: {
                DurationType: 'DayOrder',
              },
            })

            throw new Error('Expected the order to fail')
          } catch (error) {
            if (error instanceof HTTPClientError) {
              expect(error.body).toMatchObject({
                ErrorInfo: {
                  ErrorCode: 'OrderValueToSmall',
                  Message:
                    'The nominal value of your order must be above the minimum trade amount set by the exchange. Please see Trading Conditions for more information.',
                },
                ExternalReference: externalReference,
              })
              return
            }

            throw error
          }
        })

        await step('Placing an exit order with less than the minimum order value', async () => {
          const entryExternalReference = SaxoBankRandom.orderID()
          const exitExternalReference = SaxoBankRandom.orderID()

          // First we enter a position
          await app.trading.orders.post({
            RequestId: SaxoBankRandom.requestID(),
            AssetType: instrument.AssetType,
            Uic: instrument.Uic,
            BuySell: 'Buy',
            Amount: quantityToGetAboveMinimumOrderValue,
            ManualOrder: false,
            ExternalReference: entryExternalReference,
            OrderType: 'Limit',
            OrderPrice: limitPrice,
            OrderDuration: {
              DurationType: 'DayOrder',
            },
          })

          await waitForPortfolioState({
            positions: ['=', 1],
          })

          // Then we try reducing the position, with an order below the minimum order value
          try {
            await app.trading.orders.post({
              RequestId: SaxoBankRandom.requestID(),
              AssetType: instrument.AssetType,
              Uic: instrument.Uic,
              BuySell: 'Buy',
              Amount: 1, // If we just place an order for 1 unit, we know we're below the minimum order value
              ManualOrder: false,
              ExternalReference: exitExternalReference,
              OrderType: 'Limit',
              OrderPrice: limitPrice,
              OrderDuration: {
                DurationType: 'DayOrder',
              },
            })

            throw new Error('Expected the exit order to fail')
          } catch (error) {
            if (error instanceof HTTPClientError) {
              expect(error.body).toMatchObject({
                ErrorInfo: {
                  ErrorCode: 'OrderValueToSmall',
                  Message:
                    'The nominal value of your order must be above the minimum trade amount set by the exchange. Please see Trading Conditions for more information.',
                },
                ExternalReference: exitExternalReference,
              })
              return
            }

            throw error
          }
        })
      })
    }

    if (count === 0) {
      throw new Error(`Could not find any instruments to base the test on`)
    }
  })
})
