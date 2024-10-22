import { toArray } from '../../../../../../utils/async-iterable.ts'
import { expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'

test('reference-data/instruments/futuresspaces', async ({ step }) => {
  using app = new SaxoBankApplication()

  const instruments = await toArray(app.referenceData.instruments.get({ AssetTypes: ['ContractFutures'] }))

  let count = 0

  for (const instrument of instruments) {
    await step({
      name: `Uic=${instrument.Identifier} (${++count} / ${instruments.length})`,
      async fn() {
        const spaces = await app.referenceData.instruments.futuresspaces.get({ Uic: instrument.Identifier })

        expect(spaces.length).not.toBe(0)
      },
    })
  }
})
