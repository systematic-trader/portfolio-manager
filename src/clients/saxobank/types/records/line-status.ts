import {
  type GuardType,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface LineStatus extends GuardType<typeof LineStatus> {}

export const LineStatus = props({
  /** The current utilization of the credit line */
  Exposure: optional(number()),

  /** The maximum credit limit allowed */
  Line: number(),

  /** The current utilization of the credit line in proportion to the line limit */
  UtilizationPct: number(),
})
