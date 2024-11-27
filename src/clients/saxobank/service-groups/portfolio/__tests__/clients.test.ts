import { toArray } from '../../../../../utils/async-iterable.ts'
import { describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'

describe('portfolio/clients', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    test('response passes guard', async () => {
      const clients = await toArray(appLive.portfolio.clients.get())
      expect(clients).toBeDefined()
    })
  })

  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    test('response passes guard', async () => {
      const clients = await toArray(appSimulation.portfolio.clients.get())
      expect(clients).toBeDefined()
    })
  })
})
