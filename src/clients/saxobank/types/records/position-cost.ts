import {
  type GuardType,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { CostData } from './cost-data.ts'

export interface PositionCost extends GuardType<typeof PositionCost> {}

export const PositionCost = props({
  /** Costs associated with the closing trade */
  CloseCost: CostData,

  /**
   * A Estimate of the cost of closing all underlying positions
   * in requested account or client currency.
   */
  CloseCostInBaseCurrency: CostData,

  /** Currency cut percentage */
  CurrencyCutPct: optional(number()),

  /** Costs associated with the opening trade */
  OpenCost: optional(CostData),

  /** Costs associated with the opening trade in requested account or client currency */
  OpenCostInBaseCurrency: optional(CostData),
})
