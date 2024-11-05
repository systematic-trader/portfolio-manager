import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type OrderType = GuardType<typeof OrderType>

export const OrderType = enums([
  /** Algorithmic */
  'Algorithmic',

  /** If asset price goes above or below defined upper/lower limit (trigger) prices, then place related order */
  'BreakoutTrigger',

  /**
   * Guaranteed Stop.
   * Stop at price - no slippage.
   */
  'GuaranteedStop',

  /** Limit */
  'Limit',

  /** If the price moves above or below the trigger price, then place related order */
  'LimitTrigger',

  /** Market */
  'Market',

  /** None */
  'None',

  /** Stop */
  'Stop',

  /** Stop if Traded */
  'StopIfTraded',

  /** Stop Limit */
  'StopLimit',

  /**
   * If price falls below trigger price, a stop order with a trailing distance is placed.
   * Similar to a trailing stop order.
   */
  'StopTrigger',

  /** Switch */
  'Switch',

  /** Trailing Stop */
  'TrailingStop',

  /** Trailing Stop if Traded */
  'TrailingStopIfTraded',

  /** Traspaso */
  'Traspaso',

  /** A Traspaso In order initiated from an external trading system */
  'TraspasoIn',
])
