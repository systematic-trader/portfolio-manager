import { integer, optional, props } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derives/currency.ts'
import { PriceDisplayFormatType } from '../derives/price-display-format-type.ts'

export const PriceDisplayFormat = props({
  /** Number of display decimals for barrier price. One touch/no touch options only. */
  BarrierDecimals: optional(integer()),

  /** Display format of barrier price. One touch/no touch options only. */
  BarrierFormat: optional(PriceDisplayFormatType),

  /**
   * The resolution in which e.g. a price must be displayed and possibly edited.
   * Positive numbers are represents digits, and negative numbers represent fractions using this formula: 1/(2^x).
   */
  Decimals: integer(),

  /** Format code specifying how price should be formatted */
  Format: optional(PriceDisplayFormatType),

  /** Some fractional prices have decimals in the numerator, e.g. 2.5/32. This is relevant for futures and cfds on futures. */
  NumeratorDecimals: optional(integer()),

  /** The number of decimals trigger price for orders should be formatted with */
  OrderDecimals: optional(integer()),

  /** Price currency of the instrument */
  PriceCurrency: optional(Currency3),

  /** The decimals value to use when formatting strike price. Only relevant for options. */
  StrikeDecimals: optional(integer()),

  /** The price format to use when formatting strike price. Only relevant for options. */
  StrikeFormat: optional(PriceDisplayFormatType),
})
