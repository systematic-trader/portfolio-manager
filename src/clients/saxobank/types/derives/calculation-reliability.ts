import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type CalculationReliability = GuardType<typeof CalculationReliability>

export const CalculationReliability = enums([
  /** Profit/loss calculated based on a synthetic non-market price */
  'ApproximatedPrice',

  /** Currency conversion failed */
  'CurrencyConversionFailed',

  /** Failed to calculate collateral */
  'FailedToCalculateCollateral',

  /** No Market Access for price */
  'NoMarketAccess',

  /** Ok - calculation successful */
  'Ok',

  /** Calculation was ok given some conditions */
  'OkWithConditions',

  /** Calculation depends on a price that is currently unavailable */
  'PricePending',

  /** General error due to system or client configuration */
  'SystemError',

  /** Unknown price */
  'UnknownPrice',
])
