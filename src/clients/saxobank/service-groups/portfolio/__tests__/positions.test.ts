import { toArray } from '../../../../../utils/async-iterable.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../__tests__/testing-utilities.ts'
import { createOrderExternalReference, createOrderRequestId } from '../../../saxobank-random.ts'

describe('portfolio/positions', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    const { getFirstClient } = new TestingUtilities({ app: appLive })

    test('response passes guard', async () => {
      const { ClientKey } = await getFirstClient()

      const positions = await toArray(appLive.portfolio.positions.get({
        ClientKey,
      }))
      expect(positions).toBeDefined()
    })
  })

  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    const { getFirstClient, resetSimulationAccount, waitForPortfolioState } = new TestingUtilities({
      app: appSimulation,
    })

    beforeEach(resetSimulationAccount)
    afterAll(resetSimulationAccount)

    test('response passes guard, with no orders or positions', async () => {
      const { ClientKey } = await getFirstClient()

      const positions = await toArray(appSimulation.portfolio.positions.get({
        ClientKey,
      }))
      expect(positions).toBeDefined()
    })

    test('response passes guard, with an open FxSpot position', async () => {
      const { ClientKey } = await getFirstClient()

      const initialPositions = await toArray(appSimulation.portfolio.positions.get({
        ClientKey,
      }))
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
        RequestId: createOrderRequestId(),
        ExternalReference: createOrderExternalReference(),
      })

      await waitForPortfolioState({
        orders: ['=', 0],
      })

      const updatedPositions = await toArray(appSimulation.portfolio.positions.get({
        ClientKey,
      }))
      expect(updatedPositions).toBeDefined()
      expect(updatedPositions).toHaveLength(1)
    })
  })
})