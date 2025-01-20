import { expect, test } from '../../../../utils/testing.ts'
import { SaxoBankStock } from '../saxobank-stock.ts'

test('config', () => {
  const config = SaxoBankStock.config('USD', 'AAPL:XNAS')

  expect(config).toBeDefined()
})
