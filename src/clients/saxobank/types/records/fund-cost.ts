import {
  type GuardType,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { BaseFee } from './base-fee.ts'

export interface FundCost extends GuardType<typeof FundCost> {}

export const FundCost = props({
  /** Commission paid for buying a fund */
  EntryCost: optional(BaseFee),

  /** Commission paid for selling a fund */
  ExitCost: optional(BaseFee),

  /** Fee paid for holding a position in a fund */
  OnGoingCost: BaseFee,

  /**
   * Commission paid from the fund to Saxo.
   * This is not included in total cost as it's already part of Ongoing Cost.
   */
  RetrocessionCost: optional(BaseFee),

  /** Commission paid for a switch trade between two mutual funds */
  SwitchCommission: optional(BaseFee),
})
