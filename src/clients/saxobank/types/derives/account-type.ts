import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type AccountType = GuardType<typeof AccountType>

export const AccountType = enums([
  /** Account Type for AutoTrading follower accounts */
  'AutoTradingFollower',

  /** Account Type for AutoTrading leader accounts */
  'AutoTradingLeader',

  /** Account used for allocating large block orders */
  'BlockTrading',

  /**
   * Account used to hold collateral assets.
   * Not used for trading.
   */
  'Collateral',

  /**
   * Booking account for comissions only.
   * Not used for trading.
   */
  'Commission',

  /**
   * Account used to transfer funds between client accounts.
   * Not used for trading.
   */
  'Funding',

  /** Booking account for interest only. Not used for trading */
  'Interest',

  /** Margin Lending */
  'MarginLending',

  /** Default. Used for normal client accounts */
  'Normal',

  /** Partner account used to execute and clear client trades */
  'Omnibus',

  /** Account type not mapped */
  'Other',

  /** Pension account */
  'Pension',

  /**
   * Used in connection with SettlementTrading accounts.
   * SettlementTrading accounts is used on the actual trading account.
   * Settlement accounts are used on the sub accounts.
   * Not used for trading.
   */
  'Settlement',

  /**
   * For FX Settlement trading clients, this account type is used for the main trading account
   */
  'SettlementTrading',

  /**
   * Retention account for accumulating or withholding taxes.
   * Not used for trading.
   */
  'Tax',

  /** Tax favored account */
  'TaxFavoredAccount',
])
