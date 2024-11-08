import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type MarginMonitoringMode = GuardType<typeof MarginMonitoringMode>

export const MarginMonitoringMode = enums([
  /** Monitoring is based on standard equity utilization, pre-check's are done against standard equity utilization. */
  'Equity',

  /**
   * Monitoring (stop-out's) are based on credit line utilization.
   * Pre-check's are done against trading and credit line utilization.
   */
  'Lines',

  /**
   * Monitoring (stop-out's) are based on standard margin utilization.
   * Pre-check's are done against standard margin utilization.
   */
  'Margin',
])
