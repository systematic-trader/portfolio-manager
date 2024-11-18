import { describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'

describe('partnerIntegration/isAlive', () => {
  test('Live', async () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    const response = await appLive.partnerIntegration.isAlive.get()
    expect(response).toBeDefined()
  })

  test('Simulation', async () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    const response = await appSimulation.partnerIntegration.isAlive.get()
    expect(response).toBeDefined()
  })
})
