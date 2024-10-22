import { toArray } from '../../../../../utils/async-iterable.ts'
import { expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'

test('reference-data/languages', async () => {
  using app = new SaxoBankApplication()

  const languages = await toArray(app.referenceData.languages.get())

  expect(languages.length).not.toBe(0)
})
