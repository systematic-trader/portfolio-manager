import { toArray } from '../../../../../../utils/async-iterable.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../../__tests__/testing-utilities.ts'

describe('portfolio/positions/me', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    test('response passes guard', async () => {
      const positions = await toArray(appLive.portfolio.positions.me.get())
      expect(positions).toBeDefined()
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
      const positions = await toArray(appSimulation.portfolio.positions.me.get())
      expect(positions).toBeDefined()
    })

    test('response passes guard, with an open FxSpot position', async () => {
      const initialPositions = await toArray(appSimulation.portfolio.positions.me.get())
      expect(initialPositions).toBeDefined()
      expect(initialPositions).toHaveLength(0)

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

      const updatedPositions = await toArray(appSimulation.portfolio.positions.me.get())
      expect(updatedPositions).toBeDefined()
      expect(updatedPositions).toHaveLength(1)
    })
  })
})
