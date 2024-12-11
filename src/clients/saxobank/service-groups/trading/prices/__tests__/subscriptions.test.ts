import { toArray } from '../../../../../../utils/async-iterable.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../../__tests__/testing-utilities.ts'
import { SaxoBankRandom } from '../../../../saxobank-random.ts'
import type { PriceRequest } from '../../../../types/records/price-request.ts'

describe('trading/prices/subscriptions', () => {
  test('Creating price-subscriptions for different asset type', async ({ step }) => {
    using app = new SaxoBankApplication({
      type: 'Live',
    })

    const {
      createTestSubscriptionContext,
      findTradableInstruments,
    } = new TestingUtilities({ app })

    const assetTypeCandidates: PriceRequest[keyof PriceRequest]['AssetType'][] = [
      'Bond',
      'CfdOnEtc',
      'CfdOnEtf',
      'CfdOnEtn',
      'CfdOnFund',
      'CfdOnFutures',
      'CfdOnIndex',
      'CfdOnStock',
      'ContractFutures',
      'Etc',
      'Etf',
      'Etn',
      'Fund',
      'FxForwards',
      'FxSpot',
      'Stock',
    ] as const

    const limit = 500

    for (const assetType of assetTypeCandidates) {
      await step(assetType, async ({ step }) => {
        const instruments = findTradableInstruments({
          assetType,
          limit,
        })

        let count = 0

        for await (const { instrument } of instruments) {
          const progres = `${count + 1}/${limit}`
          await step(`${progres}: ${instrument.Description} (UIC ${instrument.Uic})`, async () => {
            count++

            await using context = createTestSubscriptionContext()

            switch (assetType) {
              case 'Bond':
              case 'CfdOnEtc':
              case 'CfdOnEtf':
              case 'CfdOnEtn':
              case 'CfdOnFund':
              case 'CfdOnFutures':
              case 'CfdOnIndex':
              case 'CfdOnStock':
              case 'ContractFutures':
              case 'Etc':
              case 'Etf':
              case 'Etn':
              case 'Fund':
              case 'FxSpot':
              case 'Stock': {
                const response = await app.trading.prices.subscriptions.post({
                  Arguments: {
                    AssetType: assetType,
                    Uic: instrument.Uic,
                  },
                  ContextId: context.id,
                  ReferenceId: SaxoBankRandom.stream.referenceId(),
                  Format: 'application/json',
                  RefreshRate: 1000,
                })

                expect(response).toBeDefined()
                break
              }

              case 'FxForwards': {
                const forwardDates = await toArray(app.referenceData.standarddates.forwardTenor.get({
                  Uic: instrument.Uic,
                }))

                const [earliestForwardStandardDate] = forwardDates.sort((left, right) =>
                  left.Date.localeCompare(right.Date)
                )
                if (earliestForwardStandardDate === undefined) {
                  throw new Error('Could not determine forward date')
                }

                const response = await app.trading.prices.subscriptions.post({
                  Arguments: {
                    AssetType: assetType,
                    Uic: instrument.Uic,
                    ForwardDate: earliestForwardStandardDate.Date,
                  },
                  ContextId: context.id,
                  ReferenceId: SaxoBankRandom.stream.referenceId(),
                  Format: 'application/json',
                  RefreshRate: 1000,
                })

                expect(response).toBeDefined()
                break
              }

              default: {
                throw new TypeError('Unsupported asset type')
              }
            }
          })
        }

        if (count === 0) {
          throw new Error(`Could not find any ${assetType} instruments to base test on`)
        }
      })
    }
  })
})
