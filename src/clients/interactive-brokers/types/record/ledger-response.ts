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

export const LedgerResponseEntry = props({
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

export interface LedgerResponseEntry extends GuardType<typeof LedgerResponseEntry> {}

export const LedgerResponse = record(Currency3OrBase, optional(LedgerResponseEntry))

export type LedgerResponse = GuardType<typeof LedgerResponse>
