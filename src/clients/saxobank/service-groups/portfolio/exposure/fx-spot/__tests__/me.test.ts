import { afterAll, beforeEach, describe, expect, test } from '../../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../../../__tests__/testing-utilities.ts'

describe('portfolio/exposure/fx-spot/me', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    test('response passes guard', async () => {
      const me = await appLive.portfolio.exposure.fxSpot.me.get()
      expect(me).toBeDefined()
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
      const exposure = await appSimulation.portfolio.exposure.fxSpot.me.get()
      expect(exposure).toBeDefined()
    })

    test('response passes guard, with an open FxSpot position', async () => {
      const initialExposure = await appSimulation.portfolio.exposure.fxSpot.me.get()
      expect(initialExposure).toBeDefined()

      const initialFxExposure = initialExposure.map(({ Currency }) => Currency)
      expect(initialFxExposure).toHaveLength(0)

      await appSimulation.trading.orders.post({
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

      const updatedExposure = await appSimulation.portfolio.exposure.fxSpot.me.get()
      expect(updatedExposure).toBeDefined()

      const updatedFxExposure = updatedExposure.map(({ Currency }) => Currency)
      expect(updatedFxExposure).toHaveLength(2)
      expect(updatedFxExposure).toContain('USD')
      expect(updatedFxExposure).toContain('EUR')
    })
  })
})
