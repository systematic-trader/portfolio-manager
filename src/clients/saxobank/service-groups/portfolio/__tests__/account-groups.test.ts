import { toArray } from '../../../../../utils/async-iterable.ts'
import { describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../__tests__/testing-utilities.ts'

describe('portfolio/account-groups', () => {
  describe('live', () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    const { getFirstClient } = new TestingUtilities({ app: appLive })

    test('response passes guard', async () => {
      const client = await getFirstClient()

      const [me] = await toArray(appLive.portfolio.accountGroups.get({
        ClientKey: client.ClientKey,
      }))

      expect(me).toBeDefined()
    })
  })

  describe('simulation', () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    const { getFirstClient } = new TestingUtilities({ app: appSimulation })

    test('response passes guard', async () => {
      const client = await getFirstClient()

      const accountGroups = await toArray(appSimulation.portfolio.accountGroups.get({
        ClientKey: client.ClientKey,
      }))

      expect(accountGroups).toStrictEqual([]) // there are no account groups in simulation
    })
  })
})
