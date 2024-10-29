import { describe, expect, test } from '../../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../../saxobank-application.ts'

describe('portfolio/exposure/instruments/me', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    test('response passes guard', async () => {
      const me = await appLive.portfolio.exposure.instruments.me.get()
      expect(me).toBeDefined()
    })
  })

  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    test('response passes guard', async () => {
      const me = await appSimulation.portfolio.exposure.instruments.me.get()
      expect(me).toBeDefined()
    })
  })
})