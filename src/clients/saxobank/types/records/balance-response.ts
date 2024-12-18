import {
  boolean,
  type GuardType,
  integer,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { CalculationReliability } from '../derives/calculation-reliability.ts'
import { Currency3 } from '../derives/currency.ts'
import { InitialMarginResponse } from './initial-margin-response.ts'
import { LineStatus } from './line-status.ts'
import { MarginCollateralNotAvailableDetail } from './margin-collateral-not-available-detail.ts'
import { MarginOverviewByGroup } from './margin-overview-by-group.ts'
import { SpendingPower } from './spending-power.ts'
import { TransactionsNotBookedDetail } from './transactions-not-booked-detail.ts'

export interface BalanceResponse extends GuardType<typeof BalanceResponse> {}

export const BalanceResponse = props({
  /** Account funding limit */
  AccountFundingLimit: optional(number()),

  /** Account funding limit */
  AccountNetFundedAmount: optional(number()),

  /**
   * Account Remaining Funding.
   * This field is available for TaxSaving and Pension AccountTypes, and FrancePea and FrancePeaPme SubAccountTypes.
   */
  AccountRemainingFunding: optional(number()),

  /**
   * If set, this value shields the account/client value from going below the given limit by automatically triggering closing of open positions should the limit be exceeded.
   * A limit of zero means there is no limit.
   */
  AccountValueProtectionLimit: optional(number()),

  /** In case an error was encountered while computing balances, this field indicates the source of the calculation error */
  CalculationReliability: CalculationReliability,

  /** Cash available for trading for the current account/client */
  CashAvailableForTrading: optional(number()),

  /** Current cash balance of the account/client */
  CashBalance: number(),

  /** Cash blocked for the current account/client */
  CashBlocked: number(),

  /** Cash which cannot be withdrawn (e.g. outstanding tax) */
  CashBlockedFromWithdrawal: number(),

  /** True if there are scheduled changes to margin, collateral or rating changes */
  ChangesScheduled: boolean(),

  /** Number of current closed positions */
  ClosedPositionsCount: integer(),

  /** Sum of collateral from positions, cash, collateral credit and other holdings available to maintain positions */
  CollateralAvailable: number(),

  /** The utilization state and maximum collateral credit line limit */
  CollateralCreditLine: optional(LineStatus),

  /** The utilization state and maximum collateral credit value */
  CollateralCreditValue: LineStatus,

  /** Size of loan secured by collateral */
  CollateralLoan: optional(number()),

  /** Corporate Action Unrealized Amounts */
  CorporateActionUnrealizedAmounts: number(),

  /**
   * Estimated costs payable if all position where to be closed on the account/client.
   * The provided value is negative for costs charged to the account.
   */
  CostToClosePositions: number(),

  /** The utilization state and maximum credit limit */
  CreditLine: optional(LineStatus),

  /**
   * Currency of the Account, AccountGroup, or Client, depending on the selected entity for which balances are requested.
   * All values provided in this response are denominated in this currency unless otherwise specified.
   */
  Currency: Currency3,

  /**
   * Number of decimals used to represent values in this currency.
   * For most common currency denominations this value will be: 2.
   */
  CurrencyDecimals: integer(),

  /** Net financing accruals (e.g. interest, carrying costs, and holding fees) */
  FinancingAccruals: number(),

  /** Funds available for trades settling today */
  FundsAvailableForSettlement: optional(number()),

  /** Funds reserved for trades settling today at market opening */
  FundsReservedForSettlement: optional(number()),

  /** If set, this represents the calculation entity's initial margin (purchasing power) */
  InitialMargin: optional(InitialMarginResponse),

  /** Margin credited for unnetted positions closed intraday */
  IntradayMarginDiscount: optional(number()),

  /**
   * True if the given client/account is on simple margining.
   * F.ex. Used to indicate if the account supports close all positions.
   * Typically this means the client has a single account or single account margining and no settlement accounts.
   * As well as no Fx Forwards/Options, listed options or Futures using advanced margining methods.
   */
  IsPortfolioMarginModelSimple: boolean(),

  /**
   * Level of margin already utilized in percent.
   * I.e. the ratio between the margin collateral used and the total available margin collateral.
   * Indicates distance to margin calls.
   */
  MarginAndCollateralUtilizationPct: optional(number()),

  /**
   * Margin available for trading.
   * The amount of remaining collateral available for margin trading for the account/client.
   */
  MarginAvailableForTrading: optional(number()),

  /** Current collateral deduction of unrealized positions */
  MarginCollateralNotAvailable: optional(number()),

  /** Detail of MarginCollateralNotAvailable */
  MarginCollateralNotAvailableDetail: MarginCollateralNotAvailableDetail,

  /**
   * Percentage of total margin exposure to total collateral.
   * I.e. the ratio between the Account Value and the Net Exposure.
   * If account exposure is 0, the coverage percent is also returned as 0.
   */
  MarginExposureCoveragePct: optional(number()),

  /** Total net exposure of margin traded positions across all instruments */
  MarginNetExposure: optional(number()),

  /** Instrument margin utilization for positions */
  MarginOverview: optional(MarginOverviewByGroup),

  /**
   * Sum of maintenance margin used for current positions on the account/client.
   * The provided value is negative for any margin that is charged to the available margin on the account/client.
   */
  MarginUsedByCurrentPositions: optional(number()),

  /**
   * Level of margin already utilized in percent.
   * I.e. the ratio between the margin collateral used and the total available margin collateral.
   * Indicates distance to margin calls.
   */
  MarginUtilizationPct: optional(number()),

  /**
   * Value used as basis to calculate maintinance margin.
   * It is calculated as TotalValue plus pending settlements (funds awaiting settlement for partners), minus MarginCollateralNotAvailable.
   */
  NetEquityForMargin: number(),

  /** Number of current open net positions */
  NetPositionsCount: integer(),

  /** Sum of MarketValue for all non-margin instruments held in the account/by the client */
  NonMarginPositionsValue: number(),

  /** Open Ipo order(s) count */
  OpenIpoOrdersCount: integer(),

  /** Number of current open positions */
  OpenPositionsCount: integer(),

  /** Combined market value of premium for all options, both FX and Contract Options */
  OptionPremiumsMarketValue: number(),

  /** Number of current open orders */
  OrdersCount: integer(),

  /** Indicates the value of securities that have been deposited as collateral for margin */
  OtherCollateral: number(),

  /** Other Collateral Deduction derived from regulatory contributor margin value */
  OtherCollateralDeduction: optional(number()),

  /** The utilization state and maximum settlement credit limit */
  SettlementLine: optional(LineStatus),

  /** Net current settlement value, long and short positions combined */
  SettlementValue: number(),

  /**
   * Available spending power on the account/client.
   * Seems to be optional only on the simulation environment.
   */
  SpendingPowerDetail: optional(SpendingPower),

  /** The utilization state and risk credit limit */
  TotalRiskLine: optional(LineStatus),

  /**
   * Current value of unrealized positions incl.
   * costs, cash balance and transactions not booked.
   */
  TotalValue: number(),

  /** The utilization state and maximum trading credit limit */
  TradingLine: optional(LineStatus),

  /** Value of transactions that have yet to be booked to the account/client */
  TransactionsNotBooked: number(),

  /** Detail of transaction(s) that yet have to be booked to the account/client */
  TransactionsNotBookedDetail: optional(TransactionsNotBookedDetail),

  /** Number of current open trigger orders */
  TriggerOrdersCount: integer(),

  /** ProfitLoss on all closed (netting and explicit) part of positions (Intraday netting specific) */
  UnrealizedMarginClosedProfitLoss: number(),

  /** ProfitLoss on open part of positions (Intraday netting specific) */
  UnrealizedMarginOpenProfitLoss: number(),

  /**
   * Sum of profit/loss ex.
   * costs for all margin instruments held in the account/by the client.
   */
  UnrealizedMarginProfitLoss: number(),

  /** The current unrealized profit/loss and face value of all positions excl. costs */
  UnrealizedPositionsValue: number(),

  /** The change in value of unrealized derivatives positions since opening them */
  VariationMargin: optional(number()),

  /** Cash amount withdrawn from unrealized derivatives positions (VariationMargin) */
  VariationMarginCashBalance: optional(number()),

  /** Maximmum amount that may be withdrawn from unrealized derivatives positions (VariationMargin) */
  VariationMarginThreshold: optional(number()),

  /**
   * Not documented.
   * Seems to be optional only on the simulation environment.
   */
  ExtendedTradingHoursData: optional(props({
    CostToClosePositions: number(),
    InitialMarginUncertainty: number(),
    MaintenanceMarginUncertainty: number(),
    MarginAvailableForTrading: number(),
    MarginUsedByCurrentPositions: number(),
    NonMarginPositionsValue: number(),
    TotalValue: number(),
    UncertaintyValue: optional(number()),
    UnrealizedMarginClosedProfitLoss: number(),
    UnrealizedMarginOpenProfitLoss: number(),
    UnrealizedMarginProfitLoss: number(),
    UnrealizedPositionsValue: number(),
  })),

  /**
   * Not documented.
   * Seems to be optional only on the simulation environment.
   */
  ExtendedTradingHoursUncertaintyValue: optional(number()),

  /**
   * Not documented.
   * Seems to be optional only on the simulation environment.
   */
  SpendingPower: optional(number()),

  /**
   * Not documented.
   * Seems to be optional only on the simulation environment.
   */
  SrdSpendingPower: optional(number()),
})
