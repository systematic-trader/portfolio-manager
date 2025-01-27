import * as path from 'jsr:@std/path'
import { SaxoBankApplication } from '../../saxobank-application.ts'
import { downloadSaxoBankETFs } from './download-etfs.ts'
import { downloadSaxoBankStocks } from './download-stocks.ts'

const CONFIG_DIRNAME = import.meta.dirname as string

export async function downloadSaxoBankBrokerConfig(app: SaxoBankApplication, outputPath: string): Promise<void> {
  await downloadSaxoBankETFs(app, outputPath)
  await downloadSaxoBankStocks(app, outputPath)
}

if (import.meta.main) {
  try {
    using app = new SaxoBankApplication({ type: 'Live' })

    const outputPath = path.join(CONFIG_DIRNAME, 'config')

    await downloadSaxoBankBrokerConfig(app, outputPath)
  } catch (error) {
    // deno-lint-ignore no-console
    console.error(error)
  }
}
