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
      const me = await toArray(appLive.portfolio.positions.me.get())

      expect(me).toBeDefined()
    })
  })

  // todo place some orders, wait for them to be filled, then test the response
  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    const { resetSimulationAccount } = new TestingUtilities({ app: appSimulation })

    beforeEach(() => resetSimulationAccount({ balance: 10_000_000 }))
    afterAll(() => resetSimulationAccount({ balance: 10_000_000 }))

    test('response passes guard', async () => {
      const me = await toArray(appSimulation.portfolio.positions.me.get())

      expect(me).toBeDefined()
    })
  })
})
