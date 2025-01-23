import { describe, expect, test } from '../../../../utils/testing.ts'
import { Timeout } from '../../../../utils/timeout.ts'
import { HTTPClientError } from '../../../http-client.ts'
import { SaxoBankApplication } from '../../../saxobank-application.ts'
import { SaxoBankStream } from '../../../saxobank-stream.ts'
import { TestingUtilities } from '../../__tests__/testing-utilities.ts'
import { SaxoBankRandom } from '../../saxobank-random.ts'
import { SaxoBankBroker } from '../saxobank-broker.ts'

test('cost', async () => {
  const options = await SaxoBankBroker.options({ type: 'Simulation' })
  await using broker = await SaxoBankBroker(options)
  const account = (await broker.accounts.get({ ID: Object.keys(options.accounts)[0]!, currency: 'EUR' }))!
  const apple = await account.stock('SIE:XETR')

  console.log(apple.cost)

  const order = apple.buy({ type: 'Market', quantity: 1, duration: 'Day' })

  console.log(order.cost)

  expect(order).toBeDefined()
})

using appSimulation = new SaxoBankApplication({
  type: 'Simulation',
})

const {
  getFirstClient,
  getFirstAccount,
  roundPriceToInstrumentSpecification,
  resetSimulationAccount,
  findTradableInstruments,
  calculateMinimumTradeSize,
  waitForPortfolioState,
  placeFavourableOrder,
} = new TestingUtilities({ app: appSimulation })

describe('placing invalid orders', () => {
  test('placing orders below minimum order value', async ({ step }) => {
    const account = await getFirstAccount()

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
            await appSimulation.trading.orders.post({
              RequestId: SaxoBankRandom.requestID(),
              AccountKey: account.AccountKey,
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
          await appSimulation.trading.orders.post({
            RequestId: SaxoBankRandom.requestID(),
            AccountKey: account.AccountKey,
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
            await appSimulation.trading.orders.post({
              RequestId: SaxoBankRandom.requestID(),
              AccountKey: account.AccountKey,
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

  test('checking if there are any stocks with order settings', async ({ step }) => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    for (const app of [appSimulation, appLive]) {
      await step(app.type, async () => {
        const instruments = appSimulation.referenceData.instruments.details.get({
          AssetTypes: ['Stock'],
        })

        let count = 0
        for await (const instrument of instruments) {
          const settings = instrument.OrderSetting

          if (settings === undefined) {
            continue
          }

          const { MinOrderValue, MaxOrderValue, MaxOrderSize } = settings
          if ([MinOrderValue, MaxOrderValue, MaxOrderSize].every((property) => property === undefined)) {
            continue
          }

          await step(`${instrument.Description} (UIC ${instrument.Uic})`, () => {
            count++
            throw new Error('Found instrument with order settings for either min or max order value or max order size')
          })
        }

        expect(count).toBe(0)
      })
    }
  })
})

describe('portfolio subscription', () => {
  test('orders subscription is updated when order quantity is updated', async () => {
    const client = await getFirstClient()

    await resetSimulationAccount()

    const instruments = findTradableInstruments({
      assetType: 'Stock',
      supportedOrderTypes: ['Limit'],
      limit: 1,
    })

    await using stream = new SaxoBankStream({ app: appSimulation })

    for await (const { instrument, quote } of instruments) {
      await placeFavourableOrder({
        instrument,
        quote,
        buySell: 'Buy',
        orderType: 'Limit',
      })
    }

    const orders = await stream.orders({
      ClientKey: client.ClientKey,
    })

    expect(orders.message).toHaveLength(1) // We should only have 1 order

    const initialOrder = orders.message[0]
    expect(initialOrder).toBeDefined()
    if (initialOrder === undefined) {
      return
    }

    expect(initialOrder.AssetType).toBe('Stock')
    if (initialOrder.AssetType !== 'Stock') {
      return
    }

    expect(initialOrder.OpenOrderType).toBe('Limit')
    if (initialOrder.OpenOrderType !== 'Limit') {
      return
    }

    const initialOrderAmount = initialOrder.Amount
    const updatedOrderAmount = initialOrderAmount * 2 // double up the order quantity (should be safe)

    expect(initialOrderAmount).toBeLessThan(updatedOrderAmount)

    await appSimulation.trading.orders.patch({
      AccountKey: initialOrder.AccountKey,
      AssetType: 'Stock',
      OrderId: initialOrder.OrderId,
      Amount: updatedOrderAmount,
      OrderDuration: initialOrder.Duration,
      OrderType: 'Limit',
      OrderPrice: initialOrder.Price,
    })

    // Give the update a few seconds to propagate
    await Timeout.wait(5000)

    expect(orders.message).toHaveLength(1) // We should still only have 1 order

    const updatedOrder = orders.message[0]
    expect(updatedOrder).toBeDefined()
    if (updatedOrder === undefined) {
      return
    }

    expect(updatedOrder.AssetType).toBe('Stock')
    if (updatedOrder.AssetType !== 'Stock') {
      return
    }

    expect(updatedOrder.Amount).toBe(updatedOrderAmount)
  })
})
