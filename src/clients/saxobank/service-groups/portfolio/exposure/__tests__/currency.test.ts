import { toArray } from '../../../../../../utils/async-iterable.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../../__tests__/testing-utilities.ts'
import { SaxoBankRandom } from '../../../../saxobank-random.ts'

describe('portfolio/exposure/currency', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    const { getFirstClient } = new TestingUtilities({ app: appLive })

    test('response passes guard', async () => {
      const client = await getFirstClient()

      const exposure = await toArray(appLive.portfolio.exposure.currency.get({
        ClientKey: client.ClientKey,
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
      getFirstAccount,
    } = new TestingUtilities({ app: appSimulation })

    beforeEach(resetSimulationAccount)
    afterAll(resetSimulationAccount)

    test('response passes guard, with no orders or positions', async () => {
      const client = await getFirstClient()

      const exposure = await toArray(appSimulation.portfolio.exposure.currency.get({
        ClientKey: client.ClientKey,
      }))
      expect(exposure).toBeDefined()
    })

    test('response passes guard, with an open FxSpot position', async () => {
      const client = await getFirstClient()
      const account = await getFirstAccount()

      const initialExposure = await toArray(appSimulation.portfolio.exposure.currency.get({
        ClientKey: client.ClientKey,
      }))
      expect(initialExposure).toBeDefined()

      const initialCurrencyExposure = initialExposure.map(({ Currency }) => Currency)
      expect(initialCurrencyExposure).toHaveLength(1)
      expect(initialCurrencyExposure).toContain('EUR')

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

      const updatedExposure = await toArray(appSimulation.portfolio.exposure.currency.get({
        ClientKey: client.ClientKey,
      }))
      expect(updatedExposure).toBeDefined()

      const updatedCurrencyExposure = updatedExposure.map(({ Currency }) => Currency)
      expect(updatedCurrencyExposure).toHaveLength(2)
      expect(updatedCurrencyExposure).toContain('USD')
      expect(updatedCurrencyExposure).toContain('EUR')
    })
  })
})
