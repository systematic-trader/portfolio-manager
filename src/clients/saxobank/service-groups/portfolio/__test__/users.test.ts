import { toArray } from '../../../../../utils/async-iterable.ts'
import { describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'

describe('portfolio/users', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    test('response passes guard', async () => {
      const users = await toArray(appLive.portfolio.users.get({
        IncludeSubUsers: true,
      }))
      expect(users).toBeDefined()
    })
  })

  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    test('response passes guard', async () => {
      const users = await toArray(appSimulation.portfolio.users.get({
        IncludeSubUsers: true,
      }))
      expect(users).toBeDefined()
    })
  })
})
