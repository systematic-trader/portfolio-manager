import {
  type GuardType,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { LineStatus } from './line-status.ts'

export interface InitialMarginResponse extends GuardType<typeof InitialMarginResponse> {}

export const InitialMarginResponse = props({
  /** Sum of collateral from positions, cash, collateral credit and other holdings available for opening new positions */
  CollateralAvailable: number(),

  /** Margin available for opening new positions. Initial margin available. */
  MarginAvailable: number(),

  /** Sum of initial margin currently reserved */
  MarginUsedByCurrentPositions: number(),

  /**
   * Level of margin already utilized in percent.
   * I.e. the ratio between the margin collateral used and the total available margin collateral.
   * Indicates distance to margin calls.
   */
  MarginUtilizationPct: number(),

  /** Value used as basis to calculate initial margin available */
  NetEquityForMargin: number(),

  /** Other Collateral Deduction derived from regulatory contributors margin value */
  OtherCollateralDeduction: number(),

  /** Not documented */
  CollateralCreditValue: optional(LineStatus),

  /** Not documented */
  MarginCollateralNotAvailable: number(),
})
