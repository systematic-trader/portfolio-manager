import { toArray } from '../../../../../../utils/async-iterable.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'

describe('portfolio/orders/me', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    test('response passes guard', async () => {
      const me = await toArray(appLive.portfolio.orders.me.get())
      expect(me).toBeDefined()
    })
  })

  // todo place a limit order and test the reponse (we can't use market orders, since they might be filled)
  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    test('response passes guard', async () => {
      const me = await toArray(appSimulation.portfolio.orders.me.get())
      expect(me).toBeDefined()
    })
  })
})
