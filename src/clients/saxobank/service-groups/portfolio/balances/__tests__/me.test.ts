import { afterAll, beforeEach, describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../../__tests__/testing-utilities.ts'

describe('portfolio/balances/me', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    test('response passes guard', async () => {
      const balance = await appLive.portfolio.balances.me.get()
      expect(balance).toBeDefined()
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
      const me = await appSimulation.portfolio.balances.me.get()
      expect(me).toBeDefined()
    })

    test('response passes guard, with an open FxSpot position', async () => {
      const initialBalance = await appSimulation.portfolio.balances.me.get()
      expect(initialBalance).toBeDefined()

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

      const updatedBalance = await appSimulation.portfolio.balances.me.get()
      expect(updatedBalance).toBeDefined()
      expect(updatedBalance.TotalValue).toBeLessThan(initialBalance.TotalValue)
    })
  })
})
