import {
  boolean,
  type GuardType,
  integer,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { CollateralMonitoringMode } from '../derives/collateral-monitoring-mode.ts'
import { MarginLendingEnabled } from '../derives/margin-lending-enabled.ts'
import { MarginMonitoringMode } from '../derives/margin-monitoring-mode.ts'
import { PortfolioMarginMethod } from '../derives/portfolio-margin-method.ts'

export interface AccountGroupResponse extends GuardType<typeof AccountGroupResponse> {}

export const AccountGroupResponse = props({
  /** Unique ID of the account group used for selection */
  AccountGroupKey: string(),

  /** Name of the account group, displayed to the user */
  AccountGroupName: optional(string()),

  /**
   * If set, this value shields the account value from going below the given limit by automatically triggering closing of positions should the limit be exceeded.
   * A limit of zero means there is no limit.
   */
  AccountValueProtectionLimit: optional(integer()),

  /** Unique ID of the client */
  ClientKey: string(),

  /**
   * Collateral Monitoring Mode.
   * Null when entity is not monitored on collateral.
   */
  CollateralMonitoringMode: optional(CollateralMonitoringMode),

  /** Calculation method for assessing margin utilization */
  MarginCalculationMethod: PortfolioMarginMethod,

  /** Margin Lending Enabled */
  MarginLendingEnabled: MarginLendingEnabled,

  /**
   * Margin Monitoring Mode.
   * Null when entity is not monitored on margin.
   */
  MarginMonitoringMode: optional(MarginMonitoringMode),

  /**
   * Portfolio Based Margin (PBM) is a method for mapping the risk of an investment portfolio.
   * True if enabled else false.
   */
  PortfolioBasedMarginEnabled: boolean(),

  /**
   * If true, an AccountValueProtectionLimit may be set on this account.
   * If it is false, the AccountValueProtectionLimit can be set on client or account group.
   */
  SupportsAccountValueProtectionLimit: boolean(),
})
