import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type OrderFieldGroup = GuardType<typeof OrderFieldGroup>

export const OrderFieldGroup = enums([
  /**
   * Adds information about the instrument, which is useful for display and formatting.
   * This includes Currency Code, Decimals, Instrument Description, Display Decimals, Price format and Symbol.
   */
  'DisplayAndFormat',

  /**
   * Adds information about the instrument's exchange.
   * This includes Exchange name, exchange code and open status.
   */
  'ExchangeInfo',

  /** Greeks for Option(s), only applicable to Fx Options, Contract Options and Contract options CFD */
  'Greeks',
])
