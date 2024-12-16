import {
  type GuardType,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derives/currency.ts'

export const MarginImpactBuySell = props({
  /** Currency for margin impacts */
  Currency: Currency3,

  /** The initial margin available if instrument is bought */
  InitialMarginAvailableBuy: number(),

  /** The current initial margin available */
  InitialMarginAvailableCurrent: number(),

  /** The initial margin available if instrument is sold */
  InitialMarginAvailableSell: number(),

  /** The initial margin to pay if instrument is bought */
  InitialMarginBuy: number(),

  /** The initial margin to pay if instrument is sold */
  InitialMarginSell: number(),

  /** The initial spending power available */
  InitialSpendingPower: optional(number()),

  /** The maintenance margin to pay if instrument is bought */
  MaintenanceMarginBuy: number(),

  /** The maintenance margin to pay if instrument is sold */
  MaintenanceMarginSell: number(),

  /** The maintenance spending power available */
  MaintenanceSpendingPower: number(),

  /** The margin to pay if instrument is bought */
  MarginBuy: number(),

  /** The margin to pay if instrument is sold */
  MarginSell: number(),

  /** Not documented. */
  CollateralUtilizationAfterTradeBuy: number(),

  /** Not documented. */
  CollateralUtilizationAfterTradeSell: number(),

  /** Not documented. */
  CurrentCollateralDeductionFromRiskConcentration: number(),

  /** Not documented. */
  EstimatedCollateralDeductionFromRiskConcentration: number(),

  /** Not documented. */
  InitialCollateralAvailableBuy: number(),

  /** Not documented. */
  InitialCollateralAvailableCurrent: number(),

  /** Not documented. */
  InitialCollateralAvailableSell: number(),

  /** Not documented. */
  InitialCollateralBuy: number(),

  /** Not documented. */
  InitialCollateralSell: number(),

  /** Not documented. */
  InitialMarginAndLoanUtilizationBuy: number(),

  /** Not documented. */
  InitialMarginAndLoanUtilizationSell: number(),

  /** Not documented. */
  InitialMarginUtilizationPercentBuy: number(),

  /** Not documented. */
  InitialMarginUtilizationPercentSell: number(),

  /** Not documented. */
  MaintenanceMarginAndLoanUtilizationBuy: number(),

  /** Not documented. */
  MaintenanceMarginAndLoanUtilizationSell: number(),

  /** Not documented. */
  MaintenanceMarginUtilizationPercentBuy: number(),

  /** Not documented. */
  MaintenanceMarginUtilizationPercentSell: number(),

  /** Not documented. */
  MarginAndCollateralUtilizationAfterTradeBuy: number(),

  /** Not documented. */
  MarginAndCollateralUtilizationAfterTradeSell: number(),

  /** Not documented. */
  MarginAndLoanUtilizationAfterTradeBuy: number(),

  /** Not documented. */
  MarginAndLoanUtilizationAfterTradeSell: number(),

  /** Not documented. */
  MarginUtilizationPercentBuy: number(),

  /** Not documented. */
  MarginUtilizationPercentSell: number(),
})

export type MarginImpactBuySell = GuardType<typeof MarginImpactBuySell>
