import {
  type GuardType,
  integer,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derives/currency.ts'
import { PriceDisplayFormatType } from '../derives/price-display-format-type.ts'

export interface DisplayAndFormat extends GuardType<typeof DisplayAndFormat> {}

export const DisplayAndFormat = props({
  /** The currency in which the data is displayed */
  Currency: optional(Currency3),

  /** The number of decimals in the chart data */
  Decimals: integer(),

  /** Description of the data */
  Description: optional(string()),

  /** The format in which data is delivered */
  Format: PriceDisplayFormatType,

  /**
   * Provided when format is either fractions or ModernFractions.
   * Indicates how many decimals are shown in the numerator value in a fraction.
   */
  NumeratorDecimals: optional(integer()),

  /** The symbol of the instrument */
  Symbol: optional(string()),
})
