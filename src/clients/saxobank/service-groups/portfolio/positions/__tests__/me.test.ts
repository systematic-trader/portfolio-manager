import { toArray } from '../../../../../../utils/async-iterable.ts'
import { beforeEach, describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'

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

    async function resetAccount({
      balance = 10_000_000,
    }: {
      readonly balance?: undefined | number
    } = {}) {
      const [account] = await toArray(appSimulation.portfolio.accounts.me.get())
      if (account === undefined) {
        throw new Error(`Could not determine client for simulation user`)
      }

      await appSimulation.portfolio.accounts.account.reset.put({
        AccountKey: account.AccountKey,
        NewBalance: balance,
      })
    }

    beforeEach(resetAccount)

    test('response passes guard', async () => {
      const me = await toArray(appSimulation.portfolio.positions.me.get())

      expect(me).toBeDefined()
    })
  })
})
