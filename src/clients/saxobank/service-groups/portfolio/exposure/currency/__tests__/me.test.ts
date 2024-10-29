import { afterAll, beforeEach, describe, expect, test } from '../../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../../../__tests__/testing-utilities.ts'

describe('portfolio/exposure/currency/me', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    test('response passes guard', async () => {
      const exposure = await appLive.portfolio.exposure.currency.me.get()
      expect(exposure).toBeDefined()
    })
  })

  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    const { resetSimulationAccount, waitForOrderCount } = new TestingUtilities({ app: appSimulation })

    beforeEach(resetSimulationAccount)
    afterAll(resetSimulationAccount)

    test('response passes guard, with no orders or positions', async () => {
      const exposure = await appSimulation.portfolio.exposure.currency.me.get()
      expect(exposure).toBeDefined()
    })

    test('response passes guard, with an open FxSpot position', async () => {
      const initialExposure = await appSimulation.portfolio.exposure.currency.me.get()
      expect(initialExposure).toBeDefined()

      const initialCurrencyExposure = initialExposure.map(({ Currency }) => Currency)
      expect(initialCurrencyExposure).toHaveLength(1)
      expect(initialCurrencyExposure).toContain('EUR')

      await appSimulation.trade.orders.post({
        AssetType: 'FxSpot',
        BuySell: 'Buy',
        Amount: 50_000,
        OrderType: 'Market',
        OrderDuration: { DurationType: 'DayOrder' },
        ManualOrder: false,
        Uic: 21, // EUR/USD
        RequestId: crypto.randomUUID(),
        ExternalReference: crypto.randomUUID(),
      })

      await waitForOrderCount({ count: 0 })

      const updatedExposure = await appSimulation.portfolio.exposure.currency.me.get()
      expect(updatedExposure).toBeDefined()

      const currencies = updatedExposure.map(({ Currency }) => Currency)
      expect(currencies).toHaveLength(2)
      expect(currencies).toContain('USD')
      expect(currencies).toContain('EUR')
    })
  })
})
