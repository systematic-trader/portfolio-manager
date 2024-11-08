import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type ChartSampleFieldSet = GuardType<typeof ChartSampleFieldSet>

export const ChartSampleFieldSet = enums([
  /** Return the OpenBid/Ask, HighBid/Ask, LowBid/Ask and CloseBid/Ask values */
  'BidAsk',

  /** Return the default set of fields for the specified asset type, please see the learn section for details */
  'Default',

  /** Return the Open, High, Low, Close values along with Interest and Volume */
  'LastTraded',
])
