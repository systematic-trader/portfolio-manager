import { enums } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

// This has been inferred from the instrument trading conditions endpoint (it's not documented)
export const TradingConditionRule = enums([
  'ExchangeFeeConstituents',
  'OrderAmendmentNotAllowed',
  'DayTradingNotAllowed',
])
