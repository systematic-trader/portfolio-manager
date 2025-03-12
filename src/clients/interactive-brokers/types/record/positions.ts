import {
  array,
  boolean,
  enums,
  type GuardType,
  integer,
  number,
  optional,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { CountryCodeA2 } from '../../../saxobank/types/derives/country.ts'
import { AssetClass } from '../derived/asset-class.ts'
import { Currency3 } from '../derived/currency.ts'
import { ExchangeCode } from '../derived/exchange-code.ts'

const DisplayRule = props({
  displayRuleStep: array(props({
    decimalDigits: integer(),
    lowerEdge: number(),
    wholeDigits: integer(),
  })),
  magnification: number(),
})

const IncrementRules = array(props({
  increment: number(),
  lowerEdge: number(),
}))

// Once warm, the positions endpoint also returns information about the underlying security.
// We don't nessesarily want to wait for this information, so we make everything optional.

const PositionBase = props({
  acctId: string(),
  conid: number(),

  // "secdef" part (all of these fields are not specified before the position is "warm")
  allExchanges: optional(string()), // todo comma separated list of ExchanceCode
  chineseName: optional(string()),
  countryCode: optional(CountryCodeA2),
  displayRule: optional(DisplayRule),
  fullName: optional(string()),
  hasOptions: optional(boolean()),
  incrementRules: optional(IncrementRules),
  isEventContract: optional(boolean()),
  listingExchange: optional(ExchangeCode),
  multiplier: optional(number()),
  name: optional(string()),
  pageSize: optional(integer()), // todo will this always be available?
  ticker: optional(string()),
  time: optional(number()),
})

const PositionStock = PositionBase.merge({
  assetClass: AssetClass.extract(['STK']),

  avgCost: number(),
  avgPrice: number(),
  contractDesc: string(),
  currency: Currency3,
  mktPrice: number(),
  mktValue: number(),
  position: number(),
  realizedPnl: number(),
  strike: union([number(), string({ format: 'number' })]),
  undConid: number(),
  unrealizedPnl: number(),

  // "secdef" part (all of these fields are not specified before the position is "warm")
  group: optional(string()),
  isUS: optional(boolean()),
  sector: optional(string()),
  sectorGroup: optional(string()),
  type: optional(enums(['COMMON'])),
})

const PositionFuture = PositionBase.merge({
  assetClass: AssetClass.extract(['FUT']),

  avgCost: number(),
  avgPrice: number(),
  contractDesc: string(),
  currency: Currency3,
  mktPrice: number(),
  mktValue: number(),
  position: number(),
  realizedPnl: number(),
  strike: union([number(), string({ format: 'number' })]),
  undConid: number(),
  unrealizedPnl: number(),

  // "secdef" part (all of these fields are not specified before the position is "warm")
  baseAvgCost: optional(number()),
  baseAvgPrice: optional(number()),
  baseMktPrice: optional(number()),
  baseMktValue: optional(number()),
  baseRealizedPnl: optional(number()),
  baseUnrealizedPnl: optional(number()),
  expiry: optional(string()),
  lastTradingDay: optional(string()),
  undComp: optional(string()),
  underExchange: optional(ExchangeCode),
  undSym: optional(string()),
})

const PositionTypeNotImplemented = PositionBase.merge({
  assetClass: AssetClass.exclude(['STK', 'FUT']),
}, { extendable: true })

const PositionTypes = [
  PositionFuture,
  PositionStock,
  PositionTypeNotImplemented,
]

const Position = union(PositionTypes)

export const Positions = array(Position)

export type Positions = GuardType<typeof Positions>
