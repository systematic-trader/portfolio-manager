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

const Common = props({
  acctId: string(),
  conid: number(),

  // Once warm, the positions endpoint also returns information about the underlying security.
  // We don't nessesarily want to wait for this information, so we make everything optional.
  allExchanges: optional(string()), // comma separated list of ExchanceCode
  baseAvgCost: optional(number()),
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
  pageSize: optional(integer()),
  ticker: optional(string()),
  time: optional(number()),
})

const Type = {
  Stock: Common.merge({
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
    baseAvgPrice: optional(number()),
    baseMktPrice: optional(number()),
    baseMktValue: optional(number()),
    baseRealizedPnl: optional(number()),
    baseUnrealizedPnl: optional(number()),
    group: optional(string()),
    isUS: optional(boolean()),
    sector: optional(string()),
    sectorGroup: optional(string()),
    type: optional(enums(['COMMON'])),
  }),

  Future: Common.merge({
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
  }),

  Bond: Common.merge({
    assetClass: AssetClass.extract(['BOND']),

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
    // none besides "common"
  }),

  NotImplemented: Common.merge({
    assetClass: AssetClass.exclude(['STK', 'FUT']),
  }, { extendable: true }),
}

const PositionTypes = [
  Type.Stock,
  Type.Future,
  Type.NotImplemented,
]

const Position = union(PositionTypes)

export const Positions = array(Position)

export type Positions = GuardType<typeof Positions>
