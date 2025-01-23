import { toArray } from '../../../../../utils/async-iterable.ts'
import { extractEntries } from '../../../../../utils/object.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../__tests__/testing-utilities.ts'

function filterOrderTypes<T extends string>(
  candidate: T,
): candidate is Exclude<T, 'TriggerBreakout' | 'TriggerLimit' | 'TriggerStop'> {
  return ['TriggerBreakout', 'TriggerLimit', 'TriggerStop'].includes(candidate) === false
}

describe('portfolio/orders', () => {
  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    const {
      findTradableInstruments,
      getFirstAccount,
      getFirstClient,
      placeFavourableOrder,
      resetSimulationAccount,
      waitForPortfolioState,
      calculateMinimumTradeSize,
      roundPriceToInstrumentSpecification,
    } = new TestingUtilities({ app: appSimulation })

    beforeEach(resetSimulationAccount)
    afterAll(resetSimulationAccount)

    test('response passes guard with no orders', async () => {
      const { ClientKey } = await getFirstAccount()

      const orders = await toArray(appSimulation.portfolio.orders.get({
        ClientKey,
      }))
      expect(orders).toBeDefined()
      expect(orders).toHaveLength(0)
    })

    test('response passes guard for different order types', async ({ step }) => {
      const { ClientKey } = await getFirstAccount()
      const limit = 5

      const assetTypes = {
        Bond: ['Long'],
        CfdOnEtc: ['Long', 'Short'],
        CfdOnEtf: ['Long', 'Short'],
        CfdOnEtn: ['Long', 'Short'],
        CfdOnFund: ['Long', 'Short'],
        CfdOnFutures: ['Long', 'Short'],
        CfdOnIndex: ['Long', 'Short'],
        CfdOnStock: ['Long', 'Short'],
        ContractFutures: ['Long', 'Short'],
        Etc: ['Long'],
        Etf: ['Long'],
        Etn: ['Long'],
        Fund: ['Long'],
        FxForwards: ['Long', 'Short'],
        FxSpot: ['Long', 'Short'],
        Stock: ['Long'],
      }

      for (const [assetType, tradeDirectionsToTest] of extractEntries(assetTypes)) {
        await step(assetType, async ({ step }) => {
          const tradeableInstruments = findTradableInstruments({
            assetType,
            // uics: [1351],
            // supportedOrderTypes: ['Market', 'Limit', 'Stop', 'StopIfTraded'],
            // supportedTradeDirections: ['Sell'],
            sessions: ['Closed'], // using closed will make sure that our orders are not executed
            limit,
          })

          let count = 0

          for await (const { instrument, quote, tradeDirections: supportedTradeDirections } of tradeableInstruments) {
            const progres = `${count + 1}/${limit}`
            await step(`${progres}: ${instrument.Description} (UIC ${instrument.Uic})`, async ({ step }) => {
              const orderTypesToTest = instrument.SupportedOrderTypes.filter(filterOrderTypes)

              const tradeDirections = supportedTradeDirections.filter((tradeDirection) =>
                tradeDirectionsToTest.includes(tradeDirection)
              )
              for (const tradeDirection of tradeDirections) {
                await step(tradeDirection, async ({ step }) => {
                  for (const orderType of orderTypesToTest) {
                    await step(orderType, async () => {
                      // Before we start, we should reset the simulation account, so we have no leftover orders
                      await resetSimulationAccount()

                      // Then we place the order
                      const placeOrderResponse = await placeFavourableOrder({
                        instrument,
                        orderType,
                        buySell: tradeDirection === 'Long' ? 'Buy' : 'Sell',
                        quote,
                      })
                      expect(placeOrderResponse).toBeDefined()

                      const externalReference = placeOrderResponse.ExternalReference

                      // After the order has been placed, we should be able to find it
                      const orders = await toArray(appSimulation.portfolio.orders.get({
                        ClientKey,
                      }))

                      expect(orders).toBeDefined()
                      expect(orders).toHaveLength(1)

                      const orderMatchingExternalReference = orders.find((candidate) =>
                        candidate.ExternalReference === externalReference
                      )
                      expect(orderMatchingExternalReference).toBeDefined()
                      expect(orderMatchingExternalReference?.AssetType).toStrictEqual(instrument.AssetType)
                    })
                  }
                })
              }
            })

            count++
          }

          if (count === 0) {
            throw new Error('Failed to find any instruments to base the test on')
          }
        })
      }
    })

    test('response passes guard for multiple and related orders - even after initial order has been filled', async ({ step }) => {
      const client = await getFirstClient()
      const account = await getFirstAccount()

      const instruments = findTradableInstruments({
        assetType: 'Stock',
        sessions: ['AutomatedTrading'], // We want the order to be filled
        limit: 1,
      })

      for await (const { instrument, quote } of instruments) {
        await step(instrument.Description, async () => {
          await resetSimulationAccount()

          // Start out by placing a order, that won't get filled immediately
          // This way, we always have a control-order in our account, which should be ignored, since we look for a specific order id
          await placeFavourableOrder({
            instrument,
            quote,
            buySell: 'Buy',
            orderType: 'Limit', // Start out with a limit order, so the order does not get filled immediately
          })

          // After the first order has been placed, we place another order
          // This time we remember the order id, so we can look for it specifically
          const placeOrderResponse = await appSimulation.trading.orders.post({
            AccountKey: account.AccountKey,
            AssetType: instrument.AssetType,
            Uic: instrument.Uic,
            BuySell: 'Buy',
            Amount: calculateMinimumTradeSize(instrument),
            OrderType: 'Limit',
            OrderPrice: roundPriceToInstrumentSpecification({ instrument, price: quote.Mid * 0.95 }).price,
            ExternalReference: 'entry',
            ManualOrder: false,
            OrderDuration: { DurationType: 'DayOrder' },
            Orders: [
              {
                AssetType: instrument.AssetType,
                Uic: instrument.Uic,
                BuySell: 'Sell',
                Amount: calculateMinimumTradeSize(instrument),
                OrderType: 'Limit',
                OrderPrice: roundPriceToInstrumentSpecification({ instrument, price: quote.Mid * 1.1 }).price,
                OrderDuration: { DurationType: 'GoodTillCancel' },
                ExternalReference: 'take-profit',
                ManualOrder: false,
              },
              {
                AssetType: instrument.AssetType,
                Uic: instrument.Uic,
                BuySell: 'Sell',
                Amount: calculateMinimumTradeSize(instrument),
                OrderType: 'StopIfTraded',
                OrderPrice: roundPriceToInstrumentSpecification({ instrument, price: quote.Mid * 0.90 }).price,
                OrderDuration: { DurationType: 'GoodTillCancel' },
                ExternalReference: 'stop-loss',
                ManualOrder: false,
              },
            ],
          })

          const placedOrderId = placeOrderResponse.OrderId

          const firstOrderResponse = await toArray(appSimulation.portfolio.orders.get({
            ClientKey: client.ClientKey,
            OrderId: placedOrderId,
            Status: 'All',
          }))

          expect(firstOrderResponse).toHaveLength(3) // The orders have been placed

          const placedOrder = firstOrderResponse.find((candidate) => candidate.OrderId === placedOrderId)
          if (placedOrder === undefined) {
            throw new Error('Failed to find the placed order')
          }

          if (placedOrder.AssetType !== instrument.AssetType) {
            throw new Error('The placed order does not match the instrument')
          }

          await appSimulation.trading.orders.patch({
            AccountKey: placedOrder.AccountKey,
            AssetType: instrument.AssetType,
            OrderId: placedOrderId,
            Amount: placedOrder.Amount,
            OrderDuration: {
              DurationType: 'DayOrder',
            },
            OrderType: 'Market', // Change the order type to market, so it gets filled
          })

          // After this, we should have 1 position and 1 remaining order (the first "unknown" order we placed as a control)
          await waitForPortfolioState({
            orders: ['=', 1], // "waitForPortfolioState" only considers the root-orders (related orders such as stop-loss and take-profit are not counted)
            positions: ['=', 1],
            timeout: 1000,
          })

          const secondOrderResponse = await toArray(appSimulation.portfolio.orders.get({
            ClientKey: client.ClientKey,
            Status: 'All',
          }))

          expect(secondOrderResponse).toHaveLength(0)
        })
      }
    })

    test('response passes guard for two orders in oco relation: limit and stop', async ({ step }) => {
      const client = await getFirstClient()
      const account = await getFirstAccount()

      const instruments = findTradableInstruments({
        assetType: 'Stock',
        sessions: ['AutomatedTrading'], // We want the order to be filled
        limit: 1,
      })

      for await (const { instrument, quote } of instruments) {
        await step(instrument.Description, async () => {
          await resetSimulationAccount()

          const placeOrderResponse = await appSimulation.trading.orders.post({
            AccountKey: account.AccountKey,
            Orders: [
              {
                AssetType: instrument.AssetType,
                Uic: instrument.Uic,
                BuySell: 'Buy',
                Amount: calculateMinimumTradeSize(instrument),
                OrderType: 'Limit',
                OrderPrice: roundPriceToInstrumentSpecification({ instrument, price: quote.Mid * 0.9 }).price,
                OrderDuration: { DurationType: 'GoodTillCancel' },
                ExternalReference: 'limit',
                ManualOrder: false,
              },
              {
                AssetType: instrument.AssetType,
                Uic: instrument.Uic,
                BuySell: 'Buy',
                Amount: calculateMinimumTradeSize(instrument),
                OrderType: 'StopIfTraded',
                OrderPrice: roundPriceToInstrumentSpecification({ instrument, price: quote.Mid * 1.1 }).price,
                OrderDuration: { DurationType: 'GoodTillCancel' },
                ExternalReference: 'stop',
                ManualOrder: false,
              },
            ],
          })

          expect(placeOrderResponse).toBeDefined()
          expect(placeOrderResponse.Orders).toHaveLength(2)

          const orders = await toArray(appSimulation.portfolio.orders.get({
            ClientKey: client.ClientKey,
            Status: 'All',
          }))

          for (const order of orders) {
            expect(order.AssetType).toEqual(instrument.AssetType)
            if (order.AssetType !== instrument.AssetType) {
              return
            }

            expect(order.OrderRelation).toEqual('Oco')
          }
        })
      }
    })

    test('response passes guard for two orders in oco relation: limit and stop-limit', async ({ step }) => {
      const client = await getFirstClient()
      const account = await getFirstAccount()

      const instruments = findTradableInstruments({
        assetType: 'Stock',
        sessions: ['Closed'], // We don't want the orders to be filled
        limit: 1,
      })

      for await (const { instrument, quote } of instruments) {
        await step(instrument.Description, async () => {
          await resetSimulationAccount()

          const placeOrderResponse = await appSimulation.trading.orders.post({
            AccountKey: account.AccountKey,
            Orders: [
              {
                AssetType: instrument.AssetType,
                Uic: instrument.Uic,
                BuySell: 'Buy',
                Amount: calculateMinimumTradeSize(instrument),
                OrderType: 'Limit',
                OrderPrice: roundPriceToInstrumentSpecification({ instrument, price: quote.Mid * 0.9 }).price,
                OrderDuration: { DurationType: 'DayOrder' },
                ExternalReference: 'market',
                ManualOrder: false,
              },
              {
                AssetType: instrument.AssetType,
                Uic: instrument.Uic,
                BuySell: 'Buy',
                Amount: calculateMinimumTradeSize(instrument),
                OrderType: 'StopLimit',
                OrderPrice: roundPriceToInstrumentSpecification({ instrument, price: quote.Mid * 1.1 }).price,
                StopLimitPrice: roundPriceToInstrumentSpecification({ instrument, price: quote.Mid * 1.2 }).price,
                OrderDuration: { DurationType: 'DayOrder' },
                ExternalReference: 'stop-limit',
                ManualOrder: false,
              },
            ],
          })

          expect(placeOrderResponse).toBeDefined()
          expect(placeOrderResponse.Orders).toHaveLength(2)

          const orders = await toArray(appSimulation.portfolio.orders.get({
            ClientKey: client.ClientKey,
            Status: 'All',
          }))

          for (const order of orders) {
            expect(order.AssetType).toEqual(instrument.AssetType)
            if (order.AssetType !== instrument.AssetType) {
              return
            }

            expect(order.OrderRelation).toEqual('Oco')
          }
        })
      }
    })
  })
})
