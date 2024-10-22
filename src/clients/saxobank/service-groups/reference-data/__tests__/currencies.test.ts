import { toArray } from '../../../../../utils/async-iterable.ts'
import { expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'

test('reference-data/currencies', async () => {
  using app = new SaxoBankApplication()

  const currencies = await toArray(app.referenceData.currencies.get())

  expect(currencies.length).not.toBe(0)
})
