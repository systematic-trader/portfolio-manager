import { toArray } from '../../../../../utils/async-iterable.ts'
import { describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'

describe('portfolio/accounts', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    test('response passes guard', async () => {
      const accounts = await toArray(appLive.portfolio.accounts.get({
        IncludeSubAccounts: true,
      }))
      expect(accounts).toBeDefined()
    })
  })

  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    test('response passes guard', async () => {
      const accounts = await toArray(appSimulation.portfolio.accounts.get({
        IncludeSubAccounts: true,
      }))
      expect(accounts).toBeDefined()
    })
  })
})
