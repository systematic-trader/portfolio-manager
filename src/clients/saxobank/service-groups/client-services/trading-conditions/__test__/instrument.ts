import { toArray } from '../../../../../../utils/async-iterable.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../../__tests__/testing-utilities.ts'
import type { Currency3 } from '../../../../types/derives/currency.ts'
import type { InstrumentTradingConditions } from '../../../../types/records/instrument-trading-conditions.ts'

describe('client-services/trading-conditions/instrument', () => {
  const limit = 5000
  const skip = 0

  using app = new SaxoBankApplication({ type: 'Live' })

  const { findTradableInstruments } = new TestingUtilities({ app })

  test('guard matches response for different asset types', async ({ step }) => {
    const testedAccountCurrencies = new Set<Currency3>()

    const accounts = await toArray(app.portfolio.accounts.get())

    const assetTypeCandidates: readonly (keyof InstrumentTradingConditions)[] = [
      'FxSpot',
      'Stock',
    ] as const

    for (const account of accounts) {
      if (testedAccountCurrencies.has(account.Currency)) {
        continue
      }
      testedAccountCurrencies.add(account.Currency)

      await step(`From account ${account.DisplayName ?? account.AccountId} (${account.Currency})`, async ({ step }) => {
        for (const assetType of assetTypeCandidates) {
          await step(assetType, async ({ step }) => {
            const instruments = findTradableInstruments({
              assetType,
              limit: limit + skip,
            })

            let count = 0
            for await (const { instrument } of instruments) {
              count++
              if (count < skip) {
                continue
              }

              await step(`#${count} ${instrument.Description} (UIC ${instrument.Uic})`, async () => {
                const response = await app.clientServices.tradingConditions.instrument.get({
                  AccountKey: account.AccountKey,
                  AssetType: assetType,
                  Uic: String(instrument.Uic),
                })

                expect(response).toBeDefined()
              })
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
