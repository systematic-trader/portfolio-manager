import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'

describe('trading/info-prices/subscriptions', () => {
  test('post', async () => {
    using app = new SaxoBankApplication({ type: 'Simulation' })

    const now = Date.now()

    const response = await app.trading.infoPrices.subscriptions.post({
      Arguments: {
        AssetType: 'Stock',
        Uics: ['211'], // Apple Inc.
      },
      ContextId: `todo-context-id-${now}`,
      ReferenceId: `todo-reference-id-${now}`,
      Format: 'application/json',
      RefreshRate: 1000,
    })

    expect(response).toBeDefined()

    const response2 = await app.trading.infoPrices.subscriptions.delete({
      ContextId: response.ContextId,
      ReferenceId: response.ReferenceId,
    })

    expect(response2).toBeDefined()
  })
})
