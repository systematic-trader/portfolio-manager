import { number, props, string } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const SwapPoints = props({
  /** Swap ask point */
  AskPoint: number(),

  /** TSwap bid point */
  BidPoint: number(),

  /** Date on which swap point been calculated */
  Date: string({ format: 'date-iso8601' }),

  /** Interest markup */
  Markup: number(),

  /** Time zone abbreviation */
  TimeZoneAbbreviation: string(),

  /** Time zone offset */
  TimeZoneOffset: string(),
})
