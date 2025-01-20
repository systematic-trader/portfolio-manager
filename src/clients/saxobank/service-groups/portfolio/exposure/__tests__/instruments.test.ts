import { toArray } from '../../../../../../utils/async-iterable.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../../__tests__/testing-utilities.ts'
import { SaxoBankRandom } from '../../../../saxobank-random.ts'

describe('portfolio/exposure/instruments', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    const { getFirstClient } = new TestingUtilities({ app: appLive })

    test('response passes guard', async () => {
      const { ClientKey } = await getFirstClient()

      const exposure = await toArray(appLive.portfolio.exposure.instruments.get({
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

      const exposure = await toArray(appSimulation.portfolio.exposure.instruments.get({
        ClientKey,
      }))
      expect(exposure).toBeDefined()
    })

    test('response passes guard, with an open FxSpot position', async () => {
      const { ClientKey } = await getFirstClient()

      const initialExposure = await toArray(appSimulation.portfolio.exposure.instruments.get({
        ClientKey,
      }))
      expect(initialExposure).toBeDefined()
      expect(initialExposure).toHaveLength(0)

      await appSimulation.trading.orders.post({
        AssetType: 'FxSpot',
        BuySell: 'Buy',
        Amount: 50_000,
        OrderType: 'Market',
        OrderDuration: { DurationType: 'DayOrder' },
        ManualOrder: false,
        Uic: 21, // EUR/USD
        RequestId: SaxoBankRandom.requestID(),
        ExternalReference: SaxoBankRandom.orderID(),
      })

      await waitForPortfolioState({
        orders: ['=', 0],
      })

      const updatedExposure = await toArray(appSimulation.portfolio.exposure.instruments.get({
        ClientKey,
      }))

      expect(updatedExposure).toBeDefined()
      expect(updatedExposure).toHaveLength(1)
    })
  })
})
