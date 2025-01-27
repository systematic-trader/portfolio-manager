import * as path from 'jsr:@std/path'
import { toArray } from '../../../utils/async-iterable.ts'
import { TSClass, TSProperty, TSValue, writeTSFile, type WriteTSFileOptions } from '../../../utils/write-ts-file.ts'
import type { SaxoBankApplication } from '../../saxobank-application.ts'

export async function downloadSaxoBankStocks(app: SaxoBankApplication, outputPath: string): Promise<void> {
  const instruments = await toArray(
    app.referenceData.instruments.get({
      AssetTypes: ['Stock'],
      IncludeNonTradable: false,
    }),
  )

  instruments.sort((a, b) => a.Symbol.localeCompare(b.Symbol))

  const foundStocks = new Map<string, number>()

  const output = instruments.reduce<
    Record<
      string,
      string[]
    >
  >((output, instrument) => {
    if (instrument.AssetType !== 'Stock') {
      return output
    }

    const symbol = instrument.Symbol.toUpperCase()

    foundStocks.set(instrument.CurrencyCode, (foundStocks.get(instrument.CurrencyCode) ?? 0) + 1)

    const currencySymbols = (output[instrument.CurrencyCode] ??= [])

    currencySymbols.push(symbol)

    return output
  }, {})

  const constants: WriteTSFileOptions['constants'] = Object.entries(output).map(([currency, symbols]) => {
    const symbolsProp = new TSProperty({
      key: 'symbols',
      value: new TSValue({ value: symbols, as: 'const' }),
    })

    return {
      name: currency,
      content: new TSClass({ props: [symbolsProp] }),
    }
  })

  await writeTSFile({
    filePath: path.join(outputPath, 'stock.ts'),
    constants,
  })

  // deno-lint-ignore no-console
  console.log(
    `Included ${[...foundStocks.values()].reduce((sum, count) => sum + count, 0)} stocks:`,
    Object.fromEntries([...foundStocks].sort((left, right) => left[0].localeCompare(right[0]))),
  )
}
