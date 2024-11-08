import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type TradingStatus = GuardType<typeof TradingStatus>

export const TradingStatus = enums([
  /** Instrument is non tradable */
  'NonTradable',

  /** Not Defined */
  'NotDefined',

  /** Instrument is Reduce only, which means client can only reduce the exposure by closing existing open position(s) and cannot open new position(s). */
  'ReduceOnly',

  /** Instrument is tradable */
  'Tradable',
])
