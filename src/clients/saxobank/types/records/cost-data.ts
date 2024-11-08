import {
  type GuardType,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface CostData extends GuardType<typeof CostData> {}

export const CostData = props({
  /** Additional Transaction Costs */
  AdditionalTransactionCosts: optional(number()),

  /** Transaction commission costs */
  Commission: number(),

  /** Transaction fee as charged by the underlying exchange */
  ExchangeFee: optional(number()),

  /** Transaction charges added by external facilitators */
  ExternalCharges: optional(number()),

  /** Fee or commission based on profit/loss of position. */
  PerformanceFee: optional(number()),

  /** National transaction duty/tax, where applicable */
  StampDuty: optional(number()),
})
