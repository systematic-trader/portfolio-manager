import { toArray } from '../../../../../../utils/async-iterable.ts'
import { describe, expect, test } from '../../../../../../utils/testing.ts'
import { SaxoBankApplication } from '../../../../../saxobank-application.ts'
import { TestingUtilities } from '../../../../__tests__/testing-utilities.ts'
import type { ContractOption } from '../../../../types/derives/contract-option.ts'
import type { ContractOptionEntry } from '../../../../types/records/contract-option-entry.ts'
import type { CostParameters } from '../cost.ts'

const MAXIMUM_INSTRUMENTS_PER_ASSET_TYPE = 100

const HOLDING_PERIOD_CASES = [0, 1, 365]

function progress(current: number, total: number): string {
  return `${String(current).padStart(String(total).length, '0')}/${total}`
}

function findSuitableOptionInstrument(optionSpaces: readonly ContractOptionEntry[]): undefined | ContractOption {
  for (const optionSpace of optionSpaces) {
    for (const option of optionSpace.SpecificOptions ?? []) {
      if (option.TradingStatus === 'Tradable' || option.TradingStatus === 'ReduceOnly') {
        return option
      }
    }
  }

  return undefined
}

describe('client-services/trading-conditions/cost', () => {
  using app = new SaxoBankApplication()

  const { getFirstAccount } = new TestingUtilities({ app })

  test('Getting costs for asset type', async ({ step }) => {
    const { AccountKey } = await getFirstAccount()

    const assetTypeCandidates: CostParameters['AssetType'][] = [
      'Bond',
      'CfdOnCompanyWarrant',
      'CfdOnEtc',
      'CfdOnEtf',
      'CfdOnEtn',
      'CfdOnFund',
      'CfdOnFutures',
      'CfdOnIndex',
      'CfdOnRights',
      'CfdOnStock',
      'CompanyWarrant',
      'ContractFutures',
      'Etc',
      'Etf',
      'Etn',
      'Fund',
      'FuturesOption',
      'FxNoTouchOption',
      'FxOneTouchOption',
      'FxForwards',
      'FxSpot',
      'FxSwap',
      'FxVanillaOption',
      'Rights',
      'Stock',
      'StockIndexOption',
      'StockOption',
    ] as const

    for (const assetType of assetTypeCandidates) {
      await step(assetType, async ({ step }) => {
        const instruments = await toArray(app.referenceData.instruments.get({
          AssetTypes: [assetType] as const,
          limit: MAXIMUM_INSTRUMENTS_PER_ASSET_TYPE,
        }))

        let index = 0
        for (const instrument of instruments) {
          const instrumentLabel = `${
            progress(++index, instruments.length)
          }: ${instrument.Description} (UIC=${instrument.Identifier})`

          await step(instrumentLabel, async ({ step }) => {
            for (const holdingPeriod of HOLDING_PERIOD_CASES) {
              const holdingPeriodFormatted = holdingPeriod === 0
                ? 'intraday'
                : holdingPeriod === 1
                ? `1 day`
                : `${holdingPeriod} days`
              const holdingPeriodLabel = `Holding period: ${holdingPeriodFormatted}`

              await step(holdingPeriodLabel, async () => {
                switch (instrument.AssetType) {
                  case 'Bond':
                  case 'CfdOnCompanyWarrant':
                  case 'CfdOnEtc':
                  case 'CfdOnEtf':
                  case 'CfdOnEtn':
                  case 'CfdOnFund':
                  case 'CfdOnFutures':
                  case 'CfdOnIndex':
                  case 'CfdOnRights':
                  case 'CfdOnStock':
                  case 'CompanyWarrant':
                  case 'ContractFutures':
                  case 'Etc':
                  case 'Etf':
                  case 'Etn':
                  case 'Fund':
                  case 'FxNoTouchOption':
                  case 'FxOneTouchOption':
                  case 'FxForwards':
                  case 'FxSpot':
                  case 'FxSwap':
                  case 'FxVanillaOption':
                  case 'Rights':
                  case 'Stock': {
                    const cost = await app.clientServices.tradingConditions.cost.get({
                      AccountKey,
                      Amount: 80,
                      AssetType: instrument.AssetType,
                      Price: 58,
                      Uic: instrument.Identifier,
                      HoldingPeriodInDays: holdingPeriod,
                    })

                    expect(cost).toBeDefined()

                    break
                  }

                  case 'StockOption':
                  case 'StockIndexOption':
                  case 'FuturesOption': {
                    const optionsResponse = await app.referenceData.instruments.contractoptionspaces.get({
                      OptionRootId: instrument.Identifier,
                      TradingStatus: ['Tradable', 'ReduceOnly'],
                    })

                    if (optionsResponse === undefined || optionsResponse.OptionSpace === undefined) {
                      throw new Error(`Could not options for UIC=${instrument.Identifier}`)
                    }

                    const optionInstrument = findSuitableOptionInstrument(optionsResponse.OptionSpace)

                    if (optionInstrument === undefined) {
                      throw new Error(`Could not find a suitable option for UIC=${instrument.Identifier}`)
                    }

                    const cost = await app.clientServices.tradingConditions.cost.get({
                      AccountKey,
                      Amount: 80,
                      AssetType: instrument.AssetType,
                      Price: 58,
                      Uic: optionInstrument.Uic,
                      HoldingPeriodInDays: holdingPeriod,
                    })

                    expect(cost).toBeDefined()

                    break
                  }
                }
              })
            }
          })
        }
      })
    }
  })
})
