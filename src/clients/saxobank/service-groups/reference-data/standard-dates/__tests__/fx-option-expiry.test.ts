import { toArray } from '../../../../../../utils/async-iterable.ts'
import { expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'

test('reference-data/standard-dates/fxoptionexpiry', async ({ step }) => {
  using app = new SaxoBankApplication()

  const instruments = await toArray(app.referenceData.instruments.get({
    AssetTypes: ['FxSpot'],
    limit: 25,
  }))

  const sortedByUic = instruments.toSorted((left, right) => left.Identifier - right.Identifier)

  let count = 0

  for (const instrument of sortedByUic) {
    await step({
      name:
        `${++count} / ${instruments.length}: Uic=${instrument.Identifier} Symbol=${instrument.Symbol}, ${instrument.Description}`,
      async fn() {
        const dates = await toArray(app.referenceData.standarddates.fxOptionExpiry.get({ Uic: instrument.Identifier }))

        expect(dates.length).not.toBe(0)
      },
    })
  }
})
