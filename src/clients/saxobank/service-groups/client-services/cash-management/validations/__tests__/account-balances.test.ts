import { describe, test } from '../../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../../saxobank-application.ts'

describe('client-services/cash-management/validations/account-balances', () => {
  test('From one account to another', async () => {
    const app = new SaxoBankApplication({
      type: 'Live',
    })

    const bla = await app.clientServices.cashManagement.validations.accountBalances.get({
      fromAccountKey: 'jLu|Tb7BCj||NieCJ4avZg==',
    })

    console.log(bla)
  })
})
