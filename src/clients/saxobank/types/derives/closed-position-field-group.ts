import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type ClosedPositionFieldGroup = GuardType<typeof ClosedPositionFieldGroup>

export const ClosedPositionFieldGroup = enums([
  /** Closed position data which is calculated differently whether viewed at client or account level */
  'ClosedPosition',

  /**
   * Detailed information about a closed position.
   * Applicable when ClosedPositionId is included in the request and not a subscription request.
   */
  'ClosedPositionDetails',

  /** Information about the instrument of the net position and how to display it */
  'DisplayAndFormat',

  /**
   * Adds information about the instrument's exchange.
   * This includes Exchange name, exchange code and open status
   */
  'ExchangeInfo',
])
