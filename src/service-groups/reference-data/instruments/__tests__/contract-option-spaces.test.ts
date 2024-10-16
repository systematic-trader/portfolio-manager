import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import { test } from '../../../../testing.ts'
import { OptionAssetTypeValues } from '../../../../types/records/option-details.ts'

test('reference-data/instruments/contractoptionspaces', async ({ step }) => {
  using app = new SaxoBankApplication()

  const optionsInstruments = await app.referenceData.instruments.get({ AssetTypes: OptionAssetTypeValues })

  const sortedByUic = optionsInstruments.toSorted((left, right) => left.Identifier - right.Identifier)

  let count = 0

  for (const optionInstrument of sortedByUic) {
    await step({
      name:
        `${++count} / ${optionsInstruments.length}: Uic=${optionInstrument.Identifier} Symbol=${optionInstrument.Symbol}, ${optionInstrument.Description}`,
      async fn() {
        await app.referenceData.instruments.contractoptionspaces.get({
          OptionRootId: optionInstrument.Identifier,
        })
      },
    })
  }
})
