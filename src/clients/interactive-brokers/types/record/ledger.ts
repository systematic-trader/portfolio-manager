import {
  type GuardType,
  integer,
  number,
  optional,
  props,
  record,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3OrBase } from '../derived/currency.ts'

export const LedgerEntry = props({
  acctcode: string(),
  cashbalance: number(),
  cashbalancefxsegment: number(),
  commoditymarketvalue: number(),
  corporatebondsmarketvalue: number(),
  cryptocurrencyvalue: number(),
  currency: Currency3OrBase,
  dividends: number(),
  endofbundle: optional(number()),
  exchangerate: number(),
  funds: number(),
  futuremarketvalue: number(),
  futureoptionmarketvalue: number(),
  futuresonlypnl: number(),
  interest: number(),
  issueroptionsmarketvalue: number(),
  key: string(),
  moneyfunds: number(),
  netliquidationvalue: number(),
  realizedpnl: number(),
  secondkey: Currency3OrBase,
  sessionid: number(),
  settledcash: number(),
  severity: number(),
  stockmarketvalue: number(),
  stockoptionmarketvalue: number(),
  tbillsmarketvalue: number(),
  tbondsmarketvalue: number(),
  timestamp: integer(),
  unrealizedpnl: number(),
  warrantsmarketvalue: number(),
})

export interface LedgerEntry extends GuardType<typeof LedgerEntry> {}

export const Ledger = record(Currency3OrBase, optional(LedgerEntry))

export type Ledger = GuardType<typeof Ledger>

export const LedgerMessage = props({
  'acctCode': string(),
  'cashbalance': number(),
  'cashBalanceFXSegment': number(),
  'commodityMarketValue': number(),
  'corporateBondsMarketValue': number(),
  'dividends': number(),
  'exchangeRate': number(),
  'funds': number(),
  'interest': number(),
  'issueOptionsMarketValue': number(),
  'key': string(),
  'marketValue': number(),
  'moneyFunds': number(),
  'netLiquidationValue': number(),
  'optionMarketValue': number(),
  'realizedPnl': number(),
  'secondKey': Currency3OrBase,
  'settledCash': number(),
  'severity': number(),
  'stockMarketValue': number(),
  'tBillsMarketValue': number(),
  'tBondsMarketValue': number(),
  'timestamp': number(),
  'unrealizedPnl': number(),
  'warrantsMarketValue': number(),
})

export interface LedgerMessage extends GuardType<typeof LedgerMessage> {}
