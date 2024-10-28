import { toArray } from '../../../../../../utils/async-iterable.ts'
import { afterAll, beforeEach, describe, expect, test } from '../../../../../../utils/testing.ts'
import { Timeout } from '../../../../../../utils/timeout.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { createResetSimulationAccount } from '../../../../__tests__/create-reset-simulation-account.ts'

async function waitForOrdersToBeFilled(
  {
    app,
    delay = 300, // this is a bit more than the rate limit of 240 requests per minute
    timeout = 80_000,
  }: {
    readonly app: SaxoBankApplication
    readonly delay?: undefined | number
    readonly timeout?: undefined | number
  },
) {
  const startTime = Date.now()
  while (true) {
    const elapsed = Date.now() - startTime

    const orders = await Timeout.run(timeout - elapsed, async (signal) => {
      return await toArray(app.portfolio.orders.me.get({}, { signal }))
    })

    if (orders === undefined) {
      throw new Error('Timeout waiting for orders to be filled')
    }

    if (orders.length === 0) {
      return
    }

    await Timeout.wait(delay)
  }
}

describe('portfolio/balances/me', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    test('response passes guard', async () => {
      const me = await appLive.portfolio.balances.me.get()
      expect(me).toBeDefined()
    })
  })

  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    const { resetSimulationAccount } = createResetSimulationAccount({
      app: appSimulation,
      balance: 50_000,
    })

    beforeEach(resetSimulationAccount)
    afterAll(resetSimulationAccount)

    test('response passes guard, with no orders or positions', async () => {
      const me = await appSimulation.portfolio.balances.me.get()
      expect(me).toBeDefined()
    })

    test('response passes guard, with an open FxSpot position', async () => {
      const initialBalance = await appSimulation.portfolio.balances.me.get()
      expect(initialBalance).toBeDefined()

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

      await waitForOrdersToBeFilled({ app: appSimulation })

      const updatedBalance = await appSimulation.portfolio.balances.me.get()
      expect(updatedBalance).toBeDefined()
      expect(updatedBalance.TotalValue).toBeLessThan(initialBalance.TotalValue)
    })
  })
})
