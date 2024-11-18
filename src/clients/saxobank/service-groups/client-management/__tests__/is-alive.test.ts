import { describe, expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'

describe('clientManagement/isAlive', () => {
  test('Live', async () => {
    using appLive = new SaxoBankApplication({
      type: 'Live',
    })

    const response = await appLive.clientManagement.isAlive.get()
    expect(response).toBeDefined()
  })

  test('Simulation', async () => {
    using appSimulation = new SaxoBankApplication({
      type: 'Simulation',
    })

    const response = await appSimulation.clientManagement.isAlive.get()
    expect(response).toBeDefined()
  })
})
