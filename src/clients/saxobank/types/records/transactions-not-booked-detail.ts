import {
  type GuardType,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface TransactionsNotBookedDetail extends GuardType<typeof TransactionsNotBookedDetail> {}

export const TransactionsNotBookedDetail = props({
  /** Net accrual for the transaction(s) not booked yet */
  Accrual: optional(number()),

  /** Net additional transaction cost for the transaction(s) not booked yet */
  AdditionalTransactionCost: optional(number()),

  /** Net bond value for the transaction(s) not booked yet */
  BondValue: optional(number()),

  /** Net cash deposit for the transaction(s) not booked yet */
  CashDeposit: optional(number()),

  /** Net cash reservation for the transaction(s) not booked yet */
  CashReservation: optional(number()),

  /** Net cash withdrawal for the transaction(s) not booked yet */
  CashWithdrawal: optional(number()),

  /** Net value of certificates for the transaction(s) not booked yet */
  CertificatesValue: optional(number()),

  /** Net commission for the transaction(s) not booked yet */
  Commission: optional(number()),

  /** Net exchange fee for the transaction(s) not booked yet */
  ExchangeFee: optional(number()),

  /** Net external charges for the transaction(s) not booked yet */
  ExternalCharges: optional(number()),

  /** Net funds reserved by order for the transaction(s) not booked yet */
  FundsReservedByOrder: optional(number()),

  /** IPO subscription fee for the transaction(s) not booked yet */
  IpoSubscriptionFee: optional(number()),

  /** Net value of leveraged knock-out products (Turbos) for the transaction(s) not booked yet. */
  LeveragedKnockOutProductsValue: optional(number()),

  /** Net mutual fund value for the transaction(s) not booked yet */
  MutualFundValue: optional(number()),

  /** Net option premium for the transaction(s) not booked yet */
  OptionPremium: optional(number()),

  /** Net share value for the transaction(s) not booked yet */
  ShareValue: optional(number()),

  /** Net stamp duty for the transaction(s) not booked yet */
  StampDuty: optional(number()),

  /** Net warrant premium for the transaction(s) not booked yet */
  WarrantPremium: optional(number()),
})
