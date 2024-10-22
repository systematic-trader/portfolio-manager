import { toArray } from '../../../../../../utils/async-iterable.ts'
import { expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { AssetTypeValues } from '../../../../types/derives/asset-type.ts'

test('reference-data/instruments/details', async ({ step }) => {
  using app = new SaxoBankApplication()

  for (const assetType of AssetTypeValues.toSorted()) {
    await step(assetType, async () => {
      const instruments = await toArray(app.referenceData.instruments.details.get({ AssetTypes: [assetType] }))

      expect(instruments.length).not.toBe(0)

      const firstInstrument = instruments[0]

      if (firstInstrument !== undefined) {
        const instruments2 = await toArray(app.referenceData.instruments.details.get({
          AssetTypes: [assetType],
          Uics: [firstInstrument.Uic],
        }))

        expect(instruments2.length).not.toBe(0)
      }
    })
  }
})
