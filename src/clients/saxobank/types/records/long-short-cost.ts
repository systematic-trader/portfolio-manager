import {
  type GuardType,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { BuySell } from '../derives/buy-sell.ts'
import { Currency3 } from '../derives/currency.ts'
import { FundCost } from './fund-cost.ts'
import { HoldingCost } from './holding-cost.ts'
import { TradingCost } from './trading-cost.ts'

export interface LongShortCost extends GuardType<typeof LongShortCost> {}

export const LongShortCost = props({
  /** The value indicates what side of a trade the cost applies to */
  BuySell: BuySell,

  /** Cost currency (also the Price currency of instrument) */
  Currency: Currency3,

  /**
   * Fund cost are cost charged by a fund, but not booked by Saxo.
   * They are simply running costs at the fund’s end for holding a position in the fund.
   */
  FundCost: optional(FundCost),

  /** Holding cost */
  HoldingCost: optional(HoldingCost),

  /** Total cost */
  TotalCost: number(),

  /** Total cost in percentage */
  TotalCostPct: number(),

  /** Trading cost */
  TradingCost: optional(TradingCost),
})
