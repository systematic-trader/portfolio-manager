import { HTTPClientError } from '../../../http-client.ts'
import { SaxoBankApplication } from '../../../saxobank-application.ts'
import type { ContractOptionEntry } from '../../../types/records/contract-option-entry.ts'
import { describe, expect, test } from '../../../utils/testing.ts'
import type { InfoPricesParameters } from '../info-prices.ts'

// Set this to a reasonable number (e.g. 100) to quickly test the different asset types - undefined will test info prices for all instruments
const ASSET_TYPE_INSTRUMENTS_LIMIT: number | undefined = 20

function progress(current: number, total: number) {
  return `${String(current).padStart(String(total).length, '0')}/${total}`
}

function findSuitableOptionInstrument(optionSpaces: readonly ContractOptionEntry[]) {
  for (const optionSpace of optionSpaces) {
    for (const option of optionSpace.SpecificOptions ?? []) {
      return option
    }
  }

  return undefined
}

describe('trade/info-prices', () => {
  test('Getting info prices for asset type', async ({ step }) => {
    using app = new SaxoBankApplication()

    const assetTypeCandidates: InfoPricesParameters[keyof InfoPricesParameters]['AssetType'][] = [
      'Bond',
      'CfdOnIndex',
      'CompanyWarrant',
      'CfdOnCompanyWarrant',
      'Stock',
      'CfdOnStock',
      'StockIndexOption',
      'StockOption',
      'ContractFutures',
      'CfdOnFutures',
      'Etc',
      'CfdOnEtc',
      'Etf',
      'CfdOnEtf',
      'Etn',
      'CfdOnEtn',
      'Fund',
      'CfdOnFund',
      'FuturesOption',
      'FxForwards',
      'FxNoTouchOption',
      'FxOneTouchOption',
      'FxSpot',
      'FxSwap',
      'FxVanillaOption',
      'Rights',
      'CfdOnRights',
    ] as const

    for (const assetType of assetTypeCandidates) {
      if (['Stock'].includes(assetType) === false) {
        continue
      }

      const instruments = await app.referenceData.instruments.get({
        AssetTypes: [assetType] as const,
        limit: ASSET_TYPE_INSTRUMENTS_LIMIT,
      })

      await step(assetType, async ({ step }) => {
        let instrumentCount = 0
        for (const instrument of instruments) {
          const instrumentLabel = `${instrument.Description} (UIC ${instrument.Identifier})`
          const testLabel = `${progress(++instrumentCount, instruments.length)}: ${instrumentLabel}`

          await step(testLabel, async ({ step }) => {
            switch (assetType) {
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
              case 'FxSpot':
              case 'Rights':
              case 'Stock': {
                const infoPrices = await app.trade.infoPrices.get({
                  Amount: 80,
                  AssetType: assetType,
                  Uic: instrument.Identifier,
                })

                expect(infoPrices).toBeDefined()

                break
              }

              case 'FuturesOption':
              case 'StockOption':
              case 'StockIndexOption': {
                const optionsResponse = await app.referenceData.instruments.contractoptionspaces.get({
                  OptionRootId: instrument.Identifier,
                })

                if (optionsResponse === undefined || optionsResponse.OptionSpace === undefined) {
                  throw new Error(`Could not options for UIC=${instrument.Identifier}`)
                }

                const optionInstrument = findSuitableOptionInstrument(optionsResponse.OptionSpace)

                if (optionInstrument === undefined) {
                  throw new Error(`Could not find a suitable option for UIC=${instrument.Identifier}`)
                }

                try {
                  const infoPrices = await app.trade.infoPrices.get({
                    Amount: 80,
                    AssetType: assetType,
                    Uic: optionInstrument.Uic,
                  })

                  expect(infoPrices).toBeDefined()
                } catch (error) {
                  if (error instanceof HTTPClientError && error.statusCode === 404) {
                    // deno-lint-ignore no-console
                    console.log(`Could not get info prices for option UIC=${optionInstrument.Uic}`)

                    break
                  }

                  throw error
                }

                break
              }

              case 'FxNoTouchOption':
              case 'FxOneTouchOption': {
                const today = new Date()
                const expityDate = Date.UTC(today.getFullYear(), today.getMonth() + 2, 1)

                const infoPrices = await app.trade.infoPrices.get({
                  Amount: 80,
                  AssetType: assetType,
                  Uic: instrument.Identifier,
                  ExpiryDate: new Date(expityDate).toISOString(),
                })

                expect(infoPrices).toBeDefined()

                break
              }

              case 'FxForwards': {
                const forwardDates = await app.referenceData.standarddates.forwardTenor.get({
                  Uic: instrument.Identifier,
                })

                expect(forwardDates.length).toBeGreaterThan(0)

                for (const { Date } of [{ Date: undefined }, ...forwardDates]) {
                  const stepLabel = Date === undefined ? `No specific forward date` : `Forward date ${Date}`

                  await step(stepLabel, async () => {
                    const infoPrices = await app.trade.infoPrices.get({
                      Amount: 80,
                      AssetType: assetType,
                      Uic: instrument.Identifier,
                      ForwardDate: Date,
                    })

                    expect(infoPrices).toBeDefined()
                  })
                }

                break
              }

              case 'FxSwap': {
                const forwardDates = await app.referenceData.standarddates.forwardTenor.get({
                  Uic: instrument.Identifier,
                })

                expect(forwardDates.length).toBeGreaterThan(1)

                for (let nearLegIndex = 0; nearLegIndex < forwardDates.length - 1; nearLegIndex++) {
                  for (let farLegIndex = nearLegIndex + 1; farLegIndex < forwardDates.length; farLegIndex++) {
                    const nearLeg = forwardDates[nearLegIndex]
                    const farLeg = forwardDates[farLegIndex]

                    if (nearLeg === undefined) {
                      throw new Error(`Near leg is undefined`)
                    }

                    if (farLeg === undefined) {
                      throw new Error(`Far leg is undefined`)
                    }

                    const stepLabel = `Near leg ${nearLeg.Date}, far leg ${farLeg.Date}`

                    await step(stepLabel, async () => {
                      const infoPrices = await app.trade.infoPrices.get({
                        Amount: 80,
                        AssetType: assetType,
                        Uic: instrument.Identifier,
                        ForwardDateNearLeg: nearLeg.Date,
                        ForwardDateFarLeg: farLeg.Date,
                      })

                      expect(infoPrices).toBeDefined()
                    })
                  }
                }

                break
              }

              case 'FxVanillaOption': {
                const expiryDates = await app.referenceData.standarddates.fxOptionExpiry.get({
                  Uic: instrument.Identifier,
                })

                expect(expiryDates.length).toBeGreaterThan(0)

                for (const action of ['Call', 'Put'] as const) {
                  for (const { Date } of expiryDates) {
                    const stepLabel = `${action}, ${Date}`

                    await step(stepLabel, async () => {
                      const infoPrices = await app.trade.infoPrices.get({
                        Amount: 80,
                        AssetType: assetType,
                        Uic: instrument.Identifier,
                        PutCall: action,
                        ExpiryDate: Date,
                      })

                      expect(infoPrices).toBeDefined()
                    })
                  }
                }

                break
              }
            }
          })
        }
      })
    }
  })
})
