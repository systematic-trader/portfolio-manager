import { toArray } from '../../../../../utils/async-iterable.ts'
import { describe, expect, test } from '../../../../../utils/testing.ts'
import { HTTPClientError } from '../../../../http-client.ts'
import { SaxoBankApplication } from '../../../../saxobank-application.ts'
import type { ChartsParameters } from '../charts.ts'

const MAXIMUM_INSTRUMENTS_PER_ASSET_TYPE = 250

function progress(current: number, total: number) {
  return `${String(current).padStart(String(total).length, '0')}/${total}`
}

describe('chart/charts', () => {
  test('Getting chart data for asset type', async ({ step }) => {
    using app = new SaxoBankApplication()

    const assetTypeCandidates: ChartsParameters['AssetType'][] = [
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
      'FxSpot',
      'Rights',
      'Stock',
      'StockIndex',
    ] as const

    for (const assetType of assetTypeCandidates) {
      const instruments = await toArray(app.referenceData.instruments.get({
        AssetTypes: [assetType] as const,
        limit: MAXIMUM_INSTRUMENTS_PER_ASSET_TYPE,
      }))

      await step(assetType, async ({ step: substep }) => {
        let index = 0
        for (const instrument of instruments) {
          const label = `${
            progress(++index, instruments.length)
          }: ${instrument.Description} (UIC=${instrument.Identifier})`

          await substep(label, async () => {
            try {
              const chart = await app.chart.charts.get({
                AssetType: assetType,
                Uic: instrument.Identifier,
                Horizon: 60,
                Count: 3,
              })

              expect(chart).toBeDefined()
            } catch (error) {
              if (error instanceof HTTPClientError && error.statusCode === 403) {
                // deno-lint-ignore no-console
                console.log(`No access to charts for UIC=${instrument.Identifier} (skipping)`)
                return
              }

              throw error
            }
          })
        }
      })
    }
  })

  test('Getting bid/ask ohlc chart data for fx spot', async () => {
    using app = new SaxoBankApplication()

    const chart = await app.chart.charts.get({
      AssetType: 'FxSpot',
      Uic: 8176, // Gold/US Dollar
      Horizon: 60,
      Count: 1,
    })

    expect(typeof chart.Data?.[0]?.CloseAsk).toStrictEqual('number')
    expect(typeof chart.Data?.[0]?.CloseBid).toStrictEqual('number')
    expect(typeof chart.Data?.[0]?.HighAsk).toStrictEqual('number')
    expect(typeof chart.Data?.[0]?.HighBid).toStrictEqual('number')
    expect(typeof chart.Data?.[0]?.LowAsk).toStrictEqual('number')
    expect(typeof chart.Data?.[0]?.LowBid).toStrictEqual('number')
    expect(typeof chart.Data?.[0]?.OpenAsk).toStrictEqual('number')
    expect(typeof chart.Data?.[0]?.OpenBid).toStrictEqual('number')
    expect(typeof chart.Data?.[0]?.Time).toStrictEqual('string')
  })

  test('Getting ohlc chart data for stock', async () => {
    using app = new SaxoBankApplication()

    const chart = await app.chart.charts.get({
      AssetType: 'Stock',
      Uic: 211, // Apple Inc.
      Horizon: 60,
      Count: 1,
    })

    expect(typeof chart.Data?.[0]?.Close).toStrictEqual('number')
    expect(typeof chart.Data?.[0]?.High).toStrictEqual('number')
    expect(typeof chart.Data?.[0]?.Low).toStrictEqual('number')
    expect(typeof chart.Data?.[0]?.Open).toStrictEqual('number')
    expect(typeof chart.Data?.[0]?.Volume).toStrictEqual('number')
    expect(typeof chart.Data?.[0]?.Interest).toStrictEqual('number')
    expect(typeof chart.Data?.[0]?.Time).toStrictEqual('string')
  })
})
