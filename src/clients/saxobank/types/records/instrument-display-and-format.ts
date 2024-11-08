import {
  type GuardType,
  integer,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derives/currency.ts'
import { DisplayHintType } from '../derives/display-hint-type.ts'
import { PriceDisplayFormatType } from '../derives/price-display-format-type.ts'

export interface InstrumentDisplayAndFormat extends GuardType<typeof InstrumentDisplayAndFormat> {}

export const InstrumentDisplayAndFormat = props({
  /** Number of display decimals for barrier price. One touch/no touch options only */
  BarrierDecimals: optional(integer()),

  /** Display format of barrier price. One touch/no touch options only */
  BarrierFormat: optional(PriceDisplayFormatType),

  /** The ISO currency code of the instrument */
  Currency: Currency3,

  /**
   * The resolution in which e.g. a price must be displayed and possibly edited.
   * Positive numbers are represents digits, and negative numbers represent fractions using this formula: 1/(2^x).
   * Same as DisplayDecimals.
   */
  Decimals: integer(),

  /** Description of instrument (DAX Index - Nov 2013), in English */
  Description: string(),

  /** Hint to the client application about how it should display the instrument */
  DisplayHint: optional(DisplayHintType),

  /** Format code specifying how price should be formatted */
  Format: PriceDisplayFormatType,

  /** Some fractional prices have decimals in the numerator, e.g. 2.5/32. This is relevant for futures and cfds on futures */
  NumeratorDecimals: optional(integer()),

  /** The number of decimals trigger price for orders should be formatted with */
  OrderDecimals: optional(integer()),

  /** The decimals value to use when formatting strike price. Only relevant for options */
  StrikeDecimals: optional(integer()),

  /** The price format to use when formatting strike price. Only relevant for options */
  StrikeFormat: optional(PriceDisplayFormatType),

  /** Symbol- A combination of letters used to uniquely identify a traded instrument. e.g. ODAX/X13C8950:xeur */
  Symbol: string(),

  /**
   * Common full name of the underlying instrument.
   * Only used for options and is the same as the option root description.
   * @deprecated
   */
  UnderlyingInstrumentDescription: optional(string()),
})
