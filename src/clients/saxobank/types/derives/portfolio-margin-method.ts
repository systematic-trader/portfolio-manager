import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type PortfolioMarginMethod = GuardType<typeof PortfolioMarginMethod>

export const PortfolioMarginMethod = enums([
  /** Uses Saxo exposure based margin */
  'Default',

  /** Uses rules-based the Janus methodology to calculate margin */
  'JanusMarginReplication',

  /** Uses rules-based SPAN methods to calculate margin on futures alone */
  'SpanForFutures',

  /** Uses rules-based SPAN methods to calculate margin on futures and options */
  'SpanForFuturesAndOptions',
])
