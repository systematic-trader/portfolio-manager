// deno-lint-ignore-file no-console
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
      console.log(`${infoprice.options.AssetType}-${infoprice.options.Uic}`, infoprice.state.status)
      console.error(infoprice.state.error)
      break
    }

    if (infoprice.state.status === 'disposed') {
      console.log(`${infoprice.options.AssetType}-${infoprice.options.Uic}`, infoprice.state.status)
      break
    }

    await Timeout.wait(1000)
  }
})
