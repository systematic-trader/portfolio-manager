import { toArray } from '../../../../../../utils/async-iterable.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../../__tests__/testing-utilities.ts'

describe('portfolio/exposure/fx-spot', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    const { getFirstClient } = new TestingUtilities({ app: appLive })

    test('response passes guard', async () => {
      const { ClientKey } = await getFirstClient()

      const exposure = await toArray(appLive.portfolio.exposure.fxSpot.get({
        ClientKey,
      }))
      expect(exposure).toBeDefined()
    })
  })

  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    const {
      getFirstClient,
      resetSimulationAccount,
      waitForPortfolioState,
    } = new TestingUtilities({ app: appSimulation })

    beforeEach(resetSimulationAccount)
    afterAll(resetSimulationAccount)

    test('response passes guard, with no orders or positions', async () => {
      const { ClientKey } = await getFirstClient()

      const exposure = await toArray(appSimulation.portfolio.exposure.fxSpot.get({
        ClientKey,
      }))
      expect(exposure).toBeDefined()
    })

    test('response passes guard, with an open FxSpot position', async () => {
      const { ClientKey } = await getFirstClient()

      const initialExposure = await toArray(appSimulation.portfolio.exposure.fxSpot.get({
        ClientKey,
      }))
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

      await waitForPortfolioState({
        orders: ['=', 0],
      })

      const updatedExposure = await toArray(appSimulation.portfolio.exposure.fxSpot.get({
        ClientKey,
      }))
      expect(updatedExposure).toBeDefined()

      const updatedFxExposure = updatedExposure.map(({ Currency }) => Currency)
      expect(updatedFxExposure).toHaveLength(2)
      expect(updatedFxExposure).toContain('USD')
      expect(updatedFxExposure).toContain('EUR')
    })
  })
})
