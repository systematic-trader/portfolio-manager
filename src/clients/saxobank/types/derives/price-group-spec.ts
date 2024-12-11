import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type PriceGroupSpec = GuardType<typeof PriceGroupSpec>

export const PriceGroupSpec = enums([
  /** Commission fields are returned in results */
  'Commissions',

  /** Display and Format (not mapped to a QTE strategy) */
  'DisplayAndFormat',

  /** Greeks are returned in results */
  'Greeks',

  /** Historical price changes are returned in results */
  'HistoricalChanges',

  /** Fields related to the asset type are returned in results */
  'InstrumentPriceDetails',

  /**
   * @deprecated
   * Margin impact fields are returned in results.
   * Will not be available from 1. October 2018, use MarginImpactBuySell instead.
   */
  'MarginImpact',

  /** Margin impact fields are returned in results */
  'MarginImpactBuySell',

  /** Market depth fields are returned in results */
  'MarketDepth',

  /** Informational price fields are returned in results */
  'PriceInfo',

  /** Detailed price fields are returned in results */
  'PriceInfoDetails',

  /** Quote data fields are returned in results */
  'Quote',

  /** Price time stamps */
  'Timestamps',
])
