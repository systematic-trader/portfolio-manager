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
import { AccountBenchmarkInstrument } from '../derives/account-benchmark-instrument.ts'
import { AccountSubType } from '../derives/account-sub-type.ts'
import { AccountType } from '../derives/account-type.ts'
import { AssetType } from '../derives/asset-type.ts'
import { Currency3 } from '../derives/currency.ts'
import { DividendReinvestmentConfiguration } from '../derives/dividend-reinvestment-configuration.ts'
import { ManagementType } from '../derives/management-type.ts'
import { MarginLendingEnabled } from '../derives/margin-lending-enabled.ts'
import { PortfolioMarginMethod } from '../derives/portfolio-margin-method.ts'

export const AccountResponse = props({
  /** Unique ID of the account group used for selection */
  AccountGroupKey: string(),

  /** Name of the account group, displayed to the user */
  AccountGroupName: optional(string()),

  /** Unique ID of the account, displayed to the user */
  AccountId: string(),

  /** Unique ID of the account */
  AccountKey: string(),

  /** Sub type of the account */
  AccountSubType: AccountSubType,

  /** Type of the account */
  AccountType: AccountType,

  /**
   * If set, this value shields the account value from going below the given limit by automatically triggering closing of positions should the limit be exceeded.
   * A limit of zero means there is no limit
   */
  AccountValueProtectionLimit: optional(number()),

  /** Indicates whether the account is active or not */
  Active: boolean(),

  /** If the account follows a trade leader on AutoTrading/SaxoSelect, this is the leader identifier */
  AutoTradingInvestmentId: optional(integer()),

  /** Contains the instrument to be used as comparison then evaluating account performance */
  BenchmarkInstrument: optional(AccountBenchmarkInstrument),

  /** If true, the user may enable/disable the use of cash positions as margin trading collateral on the given account */
  CanUseCashPositionsAsMarginCollateral: boolean(),

  /** Indicates if the account is configured for CFD borrowing costs */
  CfdBorrowingCostsActive: optional(boolean()),

  /** Unique ID of the client owning the account */
  ClientId: string(),

  /** Unique ID of the client - for navigation purposes */
  ClientKey: string(),

  /** The UTC date and time the account was created */
  CreationDate: string({ format: 'date-iso8601' }),

  /** Account currency */
  Currency: Currency3,

  /** Number of decimals used in currency */
  CurrencyDecimals: integer(),

  /** Indicates direct market access for the account */
  DirectMarketAccess: boolean(),

  /** Lists exchanges for which the account is direct market access enabled */
  DirectMarketExchangesIds: optional(array(string())),

  /** User customizable account name */
  DisplayName: optional(string()),

  /**
   * Indicates whether (and through which provider) dividend reinvestment is enabled for this account.
   * If dividend reinvestment is not enabled, this field is omitted from the response, in which case dividends are booked as cash on the account.
   */
  DividendReinvestmentConfig: optional(DividendReinvestmentConfiguration),

  /** FractionalOrder is enabled or not for the account */
  FractionalOrderEnabled: boolean(),

  /* Not documented */
  FractionalOrderEnabledAssetTypes: optional(array(AssetType)),

  /** Indicates that the margin exposure is calculated for this account only, without cross margining to other accounts within the same account group */
  IndividualMargining: boolean(),

  /**
   * If true, currency conversions between trade and account currency take place at time of trade settlement
   * Typically end of business day
   */
  IsCurrencyConversionAtSettlementTime: boolean(),

  /** Indicates whether trading on margin is allowed for the account */
  IsMarginTradingAllowed: boolean(),

  /**
   * Indicates whether or not the account can be shared.
   * An account can only be shared if it is the only account of its client and it is not a trial account
   */
  IsShareable: boolean(),

  /** IsTrialAccount - Is this a trial account */
  IsTrialAccount: boolean(),

  /** AssetTypes that can be traded on this account */
  LegalAssetTypes: array(AssetType),

  /** Account's Management Type */
  ManagementType: ManagementType,

  /** Calculation method for assessing margin utilization */
  MarginCalculationMethod: PortfolioMarginMethod,

  /** Margin Lending Enabled */
  MarginLendingEnabled: MarginLendingEnabled,

  /**
   * Portfolio Based Margin (PBM) is a method for mapping the risk of an investment portfolio.
   * True if enabled else false
   */
  PortfolioBasedMarginEnabled: boolean(),

  /** Returns a list of application identifiers that the account has been shared with */
  Sharing: array(string()),

  /**
   * If true, an AccountValueProtectionLimit may be set on this account.
   * If it is false, the AccountValueProtectionLimit can be set on client or account group
   */
  SupportsAccountValueProtectionLimit: boolean(),

  /** Enable/disable the use of cash positions for margin trading collateral */
  UseCashPositionsAsMarginCollateral: boolean(),

  /** Not documented */
  ExternalReference: optional(string()),
})

export interface AccountResponse extends GuardType<typeof AccountResponse> {}
