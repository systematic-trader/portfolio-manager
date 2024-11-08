import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type InfoPriceGroupSpec = GuardType<typeof InfoPriceGroupSpec>

export const InfoPriceGroupSpec = enums([
  /** Commission fields are returned in results */
  'Commissions',

  /** Display and Format */
  'DisplayAndFormat',

  /** Not documented */
  'Greeks',

  /** Historical price changes are returned in results */
  'HistoricalChanges',

  /**
   * Fields related to the asset type are returned in results.
   * Fields in this group are only returned when issuing a GET and in the initial snapshot if setting up a subscription.
   */
  'InstrumentPriceDetails',

  /** Market depth fields are returned in results */
  'MarketDepth',

  /** Informational price fields are returned in results */
  'PriceInfo',

  /** Detailed price fields are returned in results */
  'PriceInfoDetails',

  /** Quote data fields are returned in results */
  'Quote',
])
