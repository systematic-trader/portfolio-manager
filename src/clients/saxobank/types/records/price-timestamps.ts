import {
  type GuardType,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const PriceTimestamps = props({
  /** Time of ask for Bonds, Certificate, Turbo, Warrant */
  AskTime: optional(string({ format: 'date-iso8601' })),

  /** Time of bid for Bonds, Certificate, Turbo, Warrant */
  BidTime: optional(string({ format: 'date-iso8601' })),

  /** Date of a previous trading day, depending on when product is traded last time (only for exchange traded bond) */
  CloseTime: string({ format: 'date-iso8601' }),

  /** Time of high for Shares, ETF, CFD, SRD, Bonds (only exchange traded), Certificate, Turbo, Warrant */
  HighTime: string({ format: 'date-iso8601' }),

  /** Time Volume (last traded time) for Shares, ETF, CFD, SRD, Bonds, Certificate, Turbo, Warrant */
  LastTradedVolumeTime: string({ format: 'date-iso8601' }),

  /** Time of low for Shares, ETF, CFD, SRD, Bonds (only exchange traded), Certificate, Turbo, Warrant */
  LowTime: string({ format: 'date-iso8601' }),

  /** Time of open price for Shares, ETF, CFD, SRD, Bonds (only exchange traded), Certificate, Turbo, Warrant */
  OpenPriceTime: string({ format: 'date-iso8601' }),

  /** Time last ULV (Traded) for Certificate, Turbo, Warrant */
  UnderlyingUicLastTradeTime: string({ format: 'date-iso8601' }),
})

export type PriceTimestamps = GuardType<typeof PriceTimestamps>
