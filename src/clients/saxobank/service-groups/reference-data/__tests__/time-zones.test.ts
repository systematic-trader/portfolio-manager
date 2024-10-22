import { toArray } from '../../../../../utils/async-iterable.ts'
import { expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'

test('reference-data/timezones', async () => {
  using app = new SaxoBankApplication()

  const timezones = await toArray(app.referenceData.timezones.get())

  expect(timezones.length).not.toBe(0)
})
