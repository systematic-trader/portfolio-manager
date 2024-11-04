import { describe, test } from '../../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../../../__tests__/testing-utilities.ts'

describe('portfolio/accounts/account/reset', () => {
  test('response passes guard', async () => {
    using app = new SaxoBankApplication({
      type: 'Simulation',
    })

    const { getFirstAccount } = new TestingUtilities({ app })
    const { AccountKey } = await getFirstAccount()

    await app.portfolio.accounts.account.reset.put({
      AccountKey,
      NewBalance: 50000, // in euro
    })
  })
})
