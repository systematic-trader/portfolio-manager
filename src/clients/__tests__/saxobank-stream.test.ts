import { test } from '../../utils/testing.ts'
import { Timeout } from '../../utils/timeout.ts'
import { SaxoBankApplication } from '../saxobank-application.ts'
import { SaxoBankStream } from '../saxobank-stream.ts'

export const APPLE = {
  assetType: 'Stock',
  uic: 211,
} as const

export const NOVO = {
  assetType: 'Stock',
  uic: 15629,
} as const

export const MAERSK = {
  assetType: 'Stock',
  uic: 6041,
} as const

export const Bond = {
  assetType: 'Bond',
  uic: 31372500,
} as const

test('SaxoBankStream', async () => {
  using app = new SaxoBankApplication({ type: 'Simulation' })
  await using stream = new SaxoBankStream({ app })

  let count = 0

  const infoprice = stream.infoPrice(NOVO)

  infoprice.addListener('message', (message) => {
    count++
    console.log(`count=${count}:`, message)

    if (count === 3) {
      infoprice.dispose()
    }
  })

  infoprice.addListener('disposed', (_, referenceId) => {
    console.log('disposed:', referenceId)
  })

  if (1 < Math.random()) {
    console.log('created test:', infoprice.state.status)
  }

  await Timeout.wait(2000000000)
})
