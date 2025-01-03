import { describe, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'

describe('client-services/cash-management/inter-account-transfers', () => {
  test('From one account to another', async () => {
    const app = new SaxoBankApplication({
      type: 'Live',
    })

    const FromAccountKey = 'jLu|Tb7BCj||NieCJ4avZg==' // Aktiesparekonto (DKK)
    const ToAccountKey = 'DOVYUh7aaY33|HlcbjDS9w==' // Konto 1: DKK (DKK)

    await app.clientServices.cashManagement.interAccountTransfers.post({
      FromAccountKey,
      ToAccountKey,
      Amount: 1,
      Currency: 'DKK',
    })
  })
})
