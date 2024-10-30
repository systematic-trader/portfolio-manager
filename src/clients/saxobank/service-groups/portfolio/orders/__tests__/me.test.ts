import { toArray } from '../../../../../../utils/async-iterable.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../../__tests__/testing-utilities.ts'

describe('portfolio/orders/me', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    test('response passes guard', async () => {
      const me = await toArray(appLive.portfolio.orders.me.get())
      expect(me).toBeDefined()
    })
  })

  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    const { findTradableInstruments, resetSimulationAccount } = new TestingUtilities({ app: appSimulation })

    beforeEach(resetSimulationAccount)
    afterAll(resetSimulationAccount)

    test('response passes guard for market stock orders', async ({ step }) => {
      const instruments = findTradableInstruments({
        assetTypes: ['Stock'],
        limit: 100,
        sessions: ['Closed'],
      })

      let count = 0
      for await (const instrument of instruments) {
        await step(`Placing a market order for ${instrument.Description} (UIC ${instrument.Uic})`, async () => {
          const placeOrderResponse = await appSimulation.trade.orders.post({
            AssetType: 'Stock',
            Amount: 1,
            BuySell: 'Buy',
            ManualOrder: false,
            OrderType: 'Market',
            OrderDuration: { DurationType: 'DayOrder' },
            ExternalReference: crypto.randomUUID(),
            Uic: instrument.Uic,
          })
          expect(placeOrderResponse).toBeDefined()

          const orders = await toArray(appSimulation.portfolio.orders.me.get())
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

    test('response passes guard', async () => {
      const me = await toArray(appSimulation.portfolio.orders.me.get())
      expect(me).toBeDefined()
    })
  })
})
