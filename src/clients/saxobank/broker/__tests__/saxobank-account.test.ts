import { expect, test } from '../../../../utils/testing.ts'
import { SaxoBankBroker } from '../saxobank-broker.ts'

test.only('broker properties', async () => {
  const options = await SaxoBankBroker.options({ type: 'Live' })

  await using broker = await SaxoBankBroker(options)

  try {
    const account1 = broker.accounts[Object.keys(broker.accounts)[0]!]!
    const account2 = broker.accounts[Object.keys(broker.accounts)[1]!]!

    console.log('account1:', account1.ID, account1.currency)
    console.log('account2:', account2.ID, account2.currency)

    expect(account1).toBeDefined()
    expect(account2).toBeDefined()

    const order = await account2.transfer({ to: account1, amount: 100, currency: account1.currency })

    console.log('order:', order)
  } finally {
    await broker.dispose()
  }
})
