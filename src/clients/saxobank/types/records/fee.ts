import { number, props } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derives/currency.ts'

export const Fee = props({
  /** The currency of the Fee */
  CurrencyCode: Currency3,

  /** Fee value */
  Value: number(),
})
