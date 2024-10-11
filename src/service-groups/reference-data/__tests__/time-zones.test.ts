import { expect } from 'std/expect/mod.ts'
import { test } from 'std/testing/bdd.ts'
import { SaxoBankApplication } from '../../../saxobank-application.ts'

test('reference-data/timezones', async () => {
  using app = new SaxoBankApplication()

  const timezones = await app.referenceData.timezones.get()

  expect(timezones).toBeDefined()
})
