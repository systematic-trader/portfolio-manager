import { Debug } from '../../utils/debug.ts'
import { test } from '../../utils/testing.ts'
import { Timeout } from '../../utils/timeout.ts'
import { SaxoBankApplication } from '../saxobank-application.ts'
import { SaxoBankStream } from '../saxobank-stream.ts'

export const APPLE = {
  AssetType: 'Stock',
  Uic: 211,
} as const

export const NOVO = {
  AssetType: 'Stock',
  Uic: 15629,
} as const

export const MAERSK = {
  AssetType: 'Stock',
  Uic: 6041,
} as const

export const Bond = {
  AssetType: 'Bond',
  Uic: 31372500,
} as const

export const EURUSD = {
  AssetType: 'FxSpot',
  Uic: 21,
} as const

test('SaxoBankStream', async () => {
  using app = new SaxoBankApplication({ type: 'Simulation' })
  await using stream = new SaxoBankStream({ app })

  let count = 0

  const infoprice = stream.infoPrice(EURUSD)

  infoprice.addListener('message', (message) => {
    count++
    Debug('test')(`count=${count}:`, message)

    // if (count === 3) {
    //   infoprice.dispose()
    // }
  })

  infoprice.addListener('disposed', (_, referenceId) => {
    Debug('test')('disposed:', referenceId)
  })

  while (true) {
    if (infoprice.state.status === 'failed') {
      Debug('test:failed')(`${infoprice.options.AssetType}-${infoprice.options.Uic}`)
      Debug('test:error')(infoprice.state.error)
      throw infoprice.state.error
    }

    if (infoprice.state.status === 'disposed') {
      Debug('test:disposed')(`${infoprice.options.AssetType}-${infoprice.options.Uic}`)
      break
    }

    await Timeout.wait(1000)
  }

  stream.dispose()
})
