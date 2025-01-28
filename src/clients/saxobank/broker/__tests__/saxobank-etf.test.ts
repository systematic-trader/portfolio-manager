import { Debug } from '../../../../utils/debug.ts'
import { expect, test } from '../../../../utils/testing.ts'
import { SaxoBankBroker } from '../saxobank-broker.ts'

const debug = Debug('test')

test('cost', async () => {
  const options = await SaxoBankBroker.options({ type: 'Simulation' })
  await using broker = await SaxoBankBroker(options)

  const account = (await broker.accounts.get({ ID: Object.keys(options.accounts)[0]!, currency: 'EUR' }))!
  const eunl = await account.etf('EUNL:XETR')

  debug(eunl.cost)
  expect(eunl.cost).toBeDefined()

  const order = eunl.buy({ type: 'Market', quantity: 1, duration: 'Day' })

  expect(order).toBeDefined()

  debug(order.cost)
  expect(order.cost).toBeDefined()
})
