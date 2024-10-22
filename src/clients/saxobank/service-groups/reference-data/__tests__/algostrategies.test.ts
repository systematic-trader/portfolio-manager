import { toArray } from '../../../../../utils/async-iterable.ts'
import { expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'

test('reference-data/algostrategies', async () => {
  using app = new SaxoBankApplication()

  const strategies = await toArray(app.referenceData.algostrategies.get())

  expect(strategies).toBeDefined()

  const strategy = strategies[0]!

  const [result] = await toArray(app.referenceData.algostrategies.get({ name: strategy.Name }))

  expect(result).toBeDefined()
})
