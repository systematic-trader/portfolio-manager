import {
  array,
  boolean,
  type GuardType,
  integer,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AllowedTradingSessions } from '../derives/allowed-trading-sessions.ts'
import { AssetType } from '../derives/asset-type.ts'
import { ClientContractType } from '../derives/client-contract-type.ts'
import { ClientPositionNettingMethod } from '../derives/client-position-netting-method.ts'
import { ClientPositionNettingMode } from '../derives/client-position-netting-mode.ts'
import { ClientPositionNettingProfile } from '../derives/client-position-netting-profile.ts'
import { ClientType } from '../derives/client-type.ts'
import { CollateralMonitoringMode } from '../derives/collateral-monitoring-mode.ts'
import { ContractOptionsTradingProfile } from '../derives/contract-options-trading-profile.ts'
import { CountryCodeA2 } from '../derives/country.ts'
import { Currency3 } from '../derives/currency.ts'
import { MarginMonitoringMode } from '../derives/margin-monitoring-mode.ts'
import { MutualFundsCashAmountOrderCurrency } from '../derives/mutual-funds-cash-amount-order-currency.ts'
import { PortfolioMarginMethod } from '../derives/portfolio-margin-method.ts'
import { SecurityLendingEnabled } from '../derives/security-lending-enabled.ts'
import { TaxRegimeType } from '../derives/tax-regime-type.ts'

export interface ClientResponse extends GuardType<typeof ClientResponse> {}

export const ClientResponse = props({
  /**
   * If set, this value shields the total client value from going below the given limit by automatically triggering closing of positions should the limit be exceeded.
   * A limit of zero means there is no limit.
   */
  AccountValueProtectionLimit: optional(number()),

  /** Allowed Netting Profiles for Client */
  AllowedNettingProfiles: array(ClientPositionNettingProfile),

  /** Indicates if the client is allowed for extended trading hours */
  AllowedTradingSessions: AllowedTradingSessions,

  /** Unique ID of the client - for display to the user */
  ClientId: string(),

  /** The unique key for the client */
  ClientKey: string(),

  /**
   * Collateral Monitoring Mode.
   * Null when entity is not monitored on collateral.
   */
  CollateralMonitoringMode: optional(CollateralMonitoringMode),

  /** Specifies the contract options trading profile */
  ContractOptionsTradingProfile: ContractOptionsTradingProfile,

  /**
   * Client Contract Type.
   * Null if Client contract doesn’t belong to joint account.
   */
  ContractType: optional(ClientContractType),

  /** Number of decimals used in currency */
  CurrencyDecimals: integer(),

  /** The default account for this client */
  DefaultAccountId: string(),

  /** The unique key for the client's default account */
  DefaultAccountKey: string(),

  /**
   * The default currency for this client.
   * Used for example for aggregation: if the client has accounts in multiple currencies, show the aggregated P/L in the this currency */
  DefaultCurrency: Currency3,

  /** If True, the order(s) placed by default will be set to force open , therfore resulting positions will not automatically be netted with positions in the opposite direction */
  ForceOpenDefaultValue: boolean(),

  /** Indicates whether trading on margin is allowed for the account */
  IsMarginTradingAllowed: boolean(),

  /** Indicates if the client is enabled for withdrawal of unrealized profit/loss of derivatives positions */
  IsVariationMarginEligible: boolean(),

  /** The combined list of asset types, which can be traded on at least one of the accounts owned by this client */
  LegalAssetTypes: array(AssetType),

  /** Certain clients have LegalAssetTypes on the account level and there may be instrument specific exceptions, so the client application must look up the individual instruments in Ref/InstrumentDetails to determine trade and prices permissions */
  LegalAssetTypesAreIndicative: boolean(),

  /** Calculation method for assessing margin utilization */
  MarginCalculationMethod: PortfolioMarginMethod,

  /**
   * Margin Monitoring Mode.
   * Null when entity is not monitored on margin.
   */
  MarginMonitoringMode: optional(MarginMonitoringMode),

  /** Indicates the currency used when placing MutualFunds orders with OrderAmountType.CashAmount */
  MutualFundsCashAmountOrderCurrency: optional(MutualFundsCashAmountOrderCurrency),

  /** The name of the client */
  Name: string(),

  /** The position netting method for this client */
  PositionNettingMethod: ClientPositionNettingMethod,

  /** The position netting mode for this client */
  PositionNettingMode: ClientPositionNettingMode,

  /** The position netting profile for this client */
  PositionNettingProfile: ClientPositionNettingProfile,

  /** If True, Client has been marked to reduce exposure */
  ReduceExposureOnly: boolean(),

  /** Indicates if the client is enabled for security lending */
  // todo only optional on sim
  SecurityLendingEnabled: optional(SecurityLendingEnabled),

  /**
   * If true, an AccountValueProtectionLimit may be set on the client level.
   * If it is false, the AccountValueProtectionLimit must be set on individual accounts or on account group level.
   */
  SupportsAccountValueProtectionLimit: boolean(),

  /** Specifies the contract options trading profile */
  TaxRegime: optional(TaxRegimeType),

  /** Not documented */
  ClientType: ClientType,

  /** Not documented */
  // todo only optional on sim
  CountryOfResidence: optional(CountryCodeA2),

  /** Not documented */
  PartnerPlatformId: (string()),
})
