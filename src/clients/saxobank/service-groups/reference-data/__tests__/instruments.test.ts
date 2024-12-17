import { toArray } from '../../../../../utils/async-iterable.ts'
import { expect, test } from '../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import { AssetTypeValues } from '../../../types/derives/asset-type.ts'

test('reference-data/instruments', async ({ step }) => {
  using app = new SaxoBankApplication()

  for (const assetType of AssetTypeValues.toSorted()) {
    // for (const assetType of ['ContractFutures'] as const) {
    await step(assetType, async () => {
      const instruments = await toArray(app.referenceData.instruments.get({
        AssetTypes: [assetType],
        IncludeNonTradable: true,
      }))

      expect(instruments.length).not.toBe(0)
    })
  }
})
