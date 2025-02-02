import { afterAll, beforeEach, describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../__tests__/testing-utilities.ts'
import { SaxoBankRandom } from '../../../saxobank-random.ts'

describe('portfolio/balances', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    const { getFirstClient } = new TestingUtilities({ app: appLive })

    test('response passes guard', async () => {
      const client = await getFirstClient()

      const balance = await appLive.portfolio.balances.get({
        ClientKey: client.ClientKey,
      })
      expect(balance).toBeDefined()
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
      getFirstAccount,
    } = new TestingUtilities({ app: appSimulation })

    beforeEach(resetSimulationAccount)
    afterAll(resetSimulationAccount)

    test('response passes guard, with no orders or positions', async () => {
      const client = await getFirstClient()

      const balance = await appSimulation.portfolio.balances.get({
        ClientKey: client.ClientKey,
      })
      expect(balance).toBeDefined()
    })

    test('response passes guard, with an open FxSpot position', async () => {
      const client = await getFirstClient()
      const account = await getFirstAccount()

      const initialBalance = await appSimulation.portfolio.balances.get({
        ClientKey: client.ClientKey,
      })
      expect(initialBalance).toBeDefined()

      await appSimulation.trading.orders.post({
        AccountKey: account.AccountKey,
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

      const updatedBalance = await appSimulation.portfolio.balances.get({
        ClientKey: client.ClientKey,
      })
      expect(updatedBalance).toBeDefined()
      expect(updatedBalance.TotalValue).toBeLessThan(initialBalance.TotalValue)
    })
  })
})
