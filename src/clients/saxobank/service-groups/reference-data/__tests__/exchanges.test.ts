import { toArray } from '../../../../../utils/async-iterable.ts'
import { expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'

test('reference-data/exchanges', async () => {
  using app = new SaxoBankApplication()

  const exchanges = await toArray(app.referenceData.exchanges.get())

  expect(exchanges).toBeDefined()

  const exchange = exchanges[0]!

  const [result] = await toArray(app.referenceData.exchanges.get({ exchangeId: exchange.ExchangeId }))

  expect(result).toBeDefined()
})
