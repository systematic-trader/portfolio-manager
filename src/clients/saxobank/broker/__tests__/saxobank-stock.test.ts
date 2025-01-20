import { expect, test } from '../../../../utils/testing.ts'
import { SaxoBankBroker } from '../saxobank-broker.ts'
import { SaxoBankStock } from '../saxobank-stock.ts'

test('config', () => {
  const config = SaxoBankStock.config('USD', 'AAPL:XNAS')

  expect(config).toBeDefined()
})

test.only('cost', async () => {
  const options = await SaxoBankBroker.options({ type: 'Simulation' })
  await using broker = await SaxoBankBroker(options)
  const account = (await broker.accounts.get({ ID: Object.keys(options.accounts)[0]!, currency: 'EUR' }))!
  const apple = await account.stock('SIE:XETR')
  const order = apple.buy({ type: 'Market', quantity: 1, duration: 'Day' })
  const cost = await order.cost()

  console.log(cost)

  expect(cost).toBeDefined()
})
