import { toArray } from '../../../../../utils/async-iterable.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../__tests__/testing-utilities.ts'

describe('portfolio/orders', () => {
  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    const {
      // getPrice,
      // roundPriceToInstrumentSpecification,
      findTradableInstruments,
      resetSimulationAccount,
      getFirstAccount,
      calculateMinimumTradeSize,
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

      const assetTypes = ['Stock'] as const // todo include more

      for (const assetType of assetTypes) {
        await step(assetType, async ({ step }) => {
          const supportedOrderTypes = ['Market'] as const // todo include more

          for (const orderType of supportedOrderTypes) {
            await step(orderType, async ({ step }) => {
              const instruments = findTradableInstruments({
                assetTypes: [assetType],
                supportedOrderTypes: supportedOrderTypes,
                sessions: ['Closed'], // using closed will make sure that our orders are not executed
                limit,
              })

              let count = 0
              for await (const instrument of instruments) {
                await step(`${instrument.Description} (UIC ${instrument.Uic})`, async () => {
                  const placeOrderResponse = await appSimulation.trade.orders.post({
                    AssetType: assetType,
                    Amount: calculateMinimumTradeSize(instrument),
                    BuySell: 'Buy',
                    ManualOrder: false,
                    OrderType: orderType,
                    OrderDuration: { DurationType: 'DayOrder' },
                    ExternalReference: crypto.randomUUID(),
                    Uic: instrument.Uic,
                  })
                  expect(placeOrderResponse).toBeDefined()

                  const orders = await toArray(appSimulation.portfolio.orders.get({
                    ClientKey,
                  }))
                  expect(orders).toBeDefined()
                  expect(orders).toHaveLength(1)

                  await resetSimulationAccount()
                })

                count++
              }

              if (count === 0) {
                throw new Error('Failed to find any instruments to base the test on')
              }
            })
          }
        })
      }
    })
  })
})
