import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type CollateralMonitoringMode = GuardType<typeof CollateralMonitoringMode>

export const CollateralMonitoringMode = enums([
  /** Monitoring (stop-out's) are based on collateral credit value */
  'CollateralCreditValue',

  /**
   * Monitoring (stop-out's) are based on collateral credit value
   * and collateral credit line.
   */
  'MaxOfCollateralCreditValueAndCollateralCreditLine',
])
