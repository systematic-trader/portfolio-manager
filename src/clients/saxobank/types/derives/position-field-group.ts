import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type PositionFieldGroup = GuardType<typeof PositionFieldGroup>

export const PositionFieldGroup = enums([
  /** Trading costs associated with opening/closing a position */
  'Costs',

  /** Information about the instrument of the position and how to display it */
  'DisplayAndFormat',

  /**
   * Adds information about the instrument's exchange.
   * This includes Exchange name, exchange code and open status.
   */
  'ExchangeInfo',

  /**
   * Greeks for Option(s), only applicable to Fx Options, Contract Options and Contract options CFD.
   */
  'Greeks',

  /**
   * Individual Positions.
   * Base data, which does not change with client/account view, or market data.
   */
  'PositionBase',

  /** Individual PositionId only */
  'PositionIdOnly',

  /**
   * Individual Positions.
   * Dynamic Data, which changes with client/account view, or market data.
   */
  'PositionView',
])
