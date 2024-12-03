import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const OrderDurationType = enums([
  /** At the close of the trading session */
  'AtTheClose',

  /** At the opening of the trading session */
  'AtTheOpening',

  /** Day Order - Valid for the trading session */
  'DayOrder',

  /** Fill or Kill order */
  'FillOrKill',

  /** Good for Period */
  'GoodForPeriod',

  /** Good till Cancel */
  'GoodTillCancel',

  /**
   * Good till Date.
   * Expiration Date must also be specified.
   */
  'GoodTillDate',

  /** Immediate or Cancel Order */
  'ImmediateOrCancel',
])

export type OrderDurationType = GuardType<typeof OrderDurationType>
