import {
  type GuardType,
  integer,
  literal,
  number,
  optional,
  props,
  record,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derived/currency.ts'

const Currency3OrBase = union([
  Currency3,
  literal('BASE'),
])

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
  'acctCode': optional(string()),
  'cashbalance': optional(number()),
  'cashBalanceFXSegment': optional(number()),
  'commodityMarketValue': optional(number()),
  'corporateBondsMarketValue': optional(number()),
  'dividends': optional(number()),
  'exchangeRate': optional(number()),
  'funds': optional(number()),
  'interest': optional(number()),
  'issueOptionsMarketValue': optional(number()),
  'key': string(),
  'marketValue': optional(number()),
  'moneyFunds': optional(number()),
  'netLiquidationValue': optional(number()),
  'optionMarketValue': optional(number()),
  'realizedPnl': optional(number()),
  'secondKey': optional(Currency3OrBase),
  'settledCash': optional(number()),
  'severity': optional(number()),
  'stockMarketValue': optional(number()),
  'tBillsMarketValue': optional(number()),
  'tBondsMarketValue': optional(number()),
  'timestamp': number(),
  'unrealizedPnl': optional(number()),
  'warrantsMarketValue': optional(number()),
})

export interface LedgerMessage extends GuardType<typeof LedgerMessage> {}
