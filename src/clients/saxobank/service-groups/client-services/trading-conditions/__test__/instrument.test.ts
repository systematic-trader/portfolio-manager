import { toArray } from '../../../../../../utils/async-iterable.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import type { Currency3 } from '../../../../types/derives/currency.ts'
import type { InstrumentTradingConditions } from '../../../../types/records/instrument-trading-conditions.ts'

describe('client-services/trading-conditions/instrument', () => {
  const limit: number | undefined = undefined
  const skip = 0

  using app = new SaxoBankApplication({ type: 'Live' })

  test('guard matches response for different asset types', async ({ step }) => {
    const testedAccountCurrencies = new Set<Currency3>()

    const accounts = await toArray(app.portfolio.accounts.get())

    const assetTypeCandidates: readonly (keyof InstrumentTradingConditions)[] = [
      'Etf',
      'FxSpot',
      'Stock',
    ] as const

    for (const account of accounts) {
      if (testedAccountCurrencies.has(account.Currency)) {
        continue
      }
      testedAccountCurrencies.add(account.Currency)

      await step(`account ${account.DisplayName ?? account.AccountId} (${account.Currency})`, async ({ step }) => {
        for (const assetType of assetTypeCandidates) {
          await step(assetType, async ({ step }) => {
            const instruments = await toArray(app.referenceData.instruments.get({
              AssetTypes: [assetType],
              limit: limit === undefined ? undefined : limit + skip,
            }))

            let count = 0
            for (const instrument of instruments) {
              count++
              if (count < skip) {
                continue
              }

              await step(
                `${count}/${instruments.length}: ${instrument.Description} (UIC ${instrument.Identifier})`,
                async () => {
                  const response = await app.clientServices.tradingConditions.instrument.get({
                    AccountKey: account.AccountKey,
                    AssetType: assetType,
                    Uic: instrument.Identifier,
                  })

                  expect(response).toBeDefined()
                },
              )
            }

            if (count === 0) {
              throw new Error('Could not find any instruments to base the test on')
            }
          })
        }
      })
    }
  })
})
