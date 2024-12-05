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

export const EURUSD = {
  assetType: 'FxSpot',
  uic: 21,
} as const

test('SaxoBankStream', async () => {
  using app = new SaxoBankApplication({ type: 'Simulation' })
  await using stream = new SaxoBankStream({ app })

  let count = 0

  const infoprice = stream.infoPrice(EURUSD)

  infoprice.addListener('message', (message) => {
    count++
    console.log(`count=${count}:`, message)

    // if (count === 3) {
    //   infoprice.dispose()
    // }
  })

  infoprice.addListener('disposed', (_, referenceId) => {
    console.log('disposed:', referenceId)
  })

  while (true) {
    if (infoprice.state.status === 'failed') {
      console.log(`${infoprice.assetType}-${infoprice.uic}`, infoprice.state.status)
      console.error(infoprice.state.error)
      break
    }

    if (infoprice.state.status === 'disposed') {
      console.log(`${infoprice.assetType}-${infoprice.uic}`, infoprice.state.status)
      break
    }

    await Timeout.wait(1000)
  }
})
