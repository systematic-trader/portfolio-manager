import { toArray } from '../../../../../../utils/async-iterable.ts'
import { expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'

test('reference-data/standard-dates/forward-tenor', async ({ step }) => {
  using app = new SaxoBankApplication()

  const [account] = await toArray(app.portfolio.accounts.me.get())
  if (account === undefined) {
    throw new Error('No account found')
  }

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
        const dates = await toArray(app.referenceData.standarddates.forwardTenor.get({
          AccountKey: account.AccountKey,
          Uic: instrument.Identifier,
        }))

        expect(dates.length).not.toBe(0)
      },
    })
  }
})
