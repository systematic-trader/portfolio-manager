import * as path from 'jsr:@std/path'
import { toArray } from '../../../utils/async-iterable.ts'
import { TSClass, TSProperty, TSValue, writeTSFile, type WriteTSFileOptions } from '../../../utils/write-ts-file.ts'
import type { SaxoBankApplication } from '../../saxobank-application.ts'

const AssetTypes = ['Stock', 'Etf', 'Etc', 'Etn'] as const

export async function downloadSaxoBankSymbols(app: SaxoBankApplication, outputPath: string): Promise<void> {
  const instruments = await toArray(
    app.referenceData.instruments.get({
      AssetTypes,
      IncludeNonTradable: true,
    }),
  )

  instruments.sort((a, b) => a.Symbol.localeCompare(b.Symbol))

  const outputs = instruments
    .toSorted((left, right) => left.Symbol.toUpperCase().localeCompare(right.Symbol.toUpperCase()))
    .reduce((output, instrument) => {
      if (AssetTypes.includes(instrument.AssetType) === false) {
        return output
      }

      let currenciesMap = output.get(instrument.AssetType)

      if (currenciesMap === undefined) {
        currenciesMap = new Map()
        output.set(instrument.AssetType, currenciesMap)
      }

      let currencySymbols = currenciesMap.get(instrument.CurrencyCode)

      if (currencySymbols === undefined) {
        currencySymbols = new Set()
        currenciesMap.set(instrument.CurrencyCode, currencySymbols)
      }

      currencySymbols.add(instrument.Symbol.toUpperCase())

      return output
    }, new Map</* asset type */ string, Map</* currency */ string, /* symbols */ Set<string>>>())

  for (const [assetType, currenciesMap] of outputs) {
    const sum = currenciesMap.values().reduce((sum, symbols) => sum + symbols.size, 0)

    if (sum === 0) {
      // deno-lint-ignore no-console
      console.log(`No ${assetType} symbols found.`)
      continue
    }

    console.log(`Included ${sum} ${assetType}s:`)

    const constants: WriteTSFileOptions['constants'] = [...currenciesMap]
      .toSorted(([leftCurrency], [rightCurrency]) => leftCurrency.localeCompare(rightCurrency))
      .map(([currency, symbols]) => {
        console.log(`  ${currency}: ${symbols.size}`)

        const symbolsProp = new TSProperty({
          key: 'symbols',
          static: true,
          value: new TSValue({ value: [...symbols], as: 'const' }),
        })

        return {
          name: currency,
          content: new TSClass({ props: [symbolsProp] }),
        }
      })

    console.log()

    await writeTSFile({
      filePath: path.join(outputPath, `${assetType.toLowerCase()}.ts`),
      constants,
    })
  }

  // const foundStocks = new Map<string, number>()

  // const output = instruments
  //   .toSorted((left, right) => left.Symbol.toUpperCase().localeCompare(right.Symbol.toUpperCase()))
  //   .reduce<Record<string, string[]>>((output, instrument) => {
  //     if (instrument.AssetType !== 'Stock') {
  //       return output
  //     }

  //     const symbol = instrument.Symbol.toUpperCase()

  //     foundStocks.set(instrument.CurrencyCode, (foundStocks.get(instrument.CurrencyCode) ?? 0) + 1)

  //     const currencySymbols = (output[instrument.CurrencyCode] ??= [])

  //     currencySymbols.push(symbol)

  //     return output
  //   }, {})

  // const constants: WriteTSFileOptions['constants'] = Object.entries(output)
  //   .toSorted(([leftCurrency], [rightCurrency]) => leftCurrency.localeCompare(rightCurrency))
  //   .map(([currency, symbols]) => {
  //     const symbolsProp = new TSProperty({
  //       key: 'symbols',
  //       value: new TSValue({ value: symbols, as: 'const' }),
  //     })

  //     return {
  //       name: currency,
  //       content: new TSClass({ props: [symbolsProp] }),
  //     }
  //   })

  // await writeTSFile({
  //   filePath: path.join(outputPath, 'stock.ts'),
  //   constants,
  // })

  // // deno-lint-ignore no-console
  // console.log(
  //   `Included ${[...foundStocks.values()].reduce((sum, count) => sum + count, 0)} stocks:`,
  //   Object.fromEntries([...foundStocks].sort((left, right) => left[0].localeCompare(right[0]))),
  // )
}
