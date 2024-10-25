import { toArray } from '../../../../../../utils/async-iterable.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'

// todo this endpoint can only be used if the accounts netting mode is set to EndOfDay
describe('portfolio/closed-positions/me', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    test('response passes guard', async () => {
      const [me] = await toArray(appLive.portfolio.closedPositions.me.get())
      expect(me).toBeDefined()
    })
  })

  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    test('response passes guard', async () => {
      const [me] = await toArray(appSimulation.portfolio.closedPositions.me.get())
      expect(me).toBeDefined()
    })
  })
})
