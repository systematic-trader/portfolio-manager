import {
  array,
  type GuardType,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { BaseFee } from './base-fee.ts'
import { RolloverFee } from './rollover-fee.ts'
import { Tax } from './tax.ts'

export interface HoldingCost extends GuardType<typeof HoldingCost> {}

export const HoldingCost = props({
  /** The borrowing costs as a percentage per year for holding short positions in single-stock CFDs */
  BorrowingCost: optional(BaseFee),

  /**
   * For instruments where carrying costs are applied (futures, exchange traded options),
   * the percentage markup on the intebank interest rate applied for holding the position.
   */
  CarryingCost: optional(BaseFee),

  /** Holding fee if applied */
  HoldingFee: optional(BaseFee),

  /** Interest for SRDs */
  InterestFee: optional(BaseFee),

  /** Loan interest cost */
  LoanInterestCost: optional(BaseFee),

  /** Financing charge markup */
  OvernightFinancing: optional(BaseFee),

  /** Rollover fee for SRDs - Charged if position is rolled over */
  RolloverFee: optional(RolloverFee),

  /** The swap points */
  SwapPoints: optional(BaseFee),

  /** List of taxes applied */
  Tax: optional(array(Tax)),
})
