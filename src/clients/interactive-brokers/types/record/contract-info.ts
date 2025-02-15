import {
  array,
  boolean,
  enums,
  type GuardType,
  integer,
  literal,
  number,
  optional,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { extractValues } from '../../../../utils/object.ts'
import { Currency3 } from '../derived/currency.ts'
import { ExchangeCode } from '../derived/exchange-code.ts'
import { TimeInForce } from '../derived/time-in-force.ts'
import { AssetClass } from './asset-class.ts'

// Indicates permitted order types for use with standard quantity trading
const OrderType = enums([
  'limit',
  'midprice',
  'market',
  'stop',
  'stop_limit',
  'mit',
  'lit',
  'trailing_stop',
  'trailing_stop_limit',
  'relative',
  'marketonclose',
  'limitonclose',
])

// Indicates accepted order types for use with cash quantity
const CashOrderType = OrderType.extract([
  'limit',
  'market',
  'stop',
  'stop_limit',
  'mit',
  'lit',
  'trailing_stop',
  'trailing_stop_limit',
])

// Indicates permitted order types for use with fractional trading
const FractionalOrderTypes = OrderType.extract([
  'limit',
  'market',
  'stop',
  'stop_limit',
  'mit',
  'lit',
  'trailing_stop',
  'trailing_stop_limit',
])

// Indicates permitted algo types for use with the given contract.
const AlgoritmicOrderTypes = OrderType.extract([
  'limit',
  'stop_limit',
  'lit',
  'trailing_stop_limit',
  'relative',
  'marketonclose',
  'limitonclose',
])

const ContractRules = props({
  algoEligible: boolean(),
  allOrNoneEligible: boolean(),
  canTradeAcctIds: array(string()),
  cashCcy: Currency3,
  cashQtyIncr: number(),
  cashSize: number(),
  costReport: boolean(),
  cqtTypes: array(CashOrderType),
  defaultSize: number(),
  forceOrderPreview: boolean(),
  fraqInt: number(),
  fraqTypes: array(FractionalOrderTypes),
  hasSecondary: boolean(),
  ibAlgoTypes: optional(array(AlgoritmicOrderTypes)),
  increment: number(),
  incrementDigits: number(),
  incrementRules: array(
    props({
      increment: number(),
      lowerEdge: number(),
    }),
  ),
  incrementType: number(),
  limitPrice: optional(number()),
  negativeCapable: boolean(),
  orderDefaults: props({ LMT: props({ LP: string() }) }), // 'empty'
  orderTypes: array(OrderType),
  orderTypesOutside: array(OrderType),
  overnightEligible: boolean(),
  preview: boolean(),
  sizeIncrement: number(),
  stopprice: optional(number()),
  tifDefaults: props({
    TIF: TimeInForce,
    SIZE: string({ format: 'number' }),
    // DEFAULT_ACCT: optional(string())
    // PMALGO: optional(boolean())
  }),

  // e.g.
  // 'IOC/MARKET,LIMIT,RELATIVE,MARKETONCLOSE,MIDPRICE,LIMITONCLOSE,MKT_PROTECT,STPPRT,a',
  // 'GTC/o,a',
  // 'OPG/LIMIT,MARKET,a',
  // 'GTD/o,a',
  // 'DAY/o,a',
  tifTypes: array(string()),
})

// #region ContractInfoSTK
export const ContractInfoSTK = props({
  allow_sell_long: boolean(),
  category: optional(string()),
  company_name: string(),
  con_id: integer(),
  contract_clarification_type: literal('PRIIPS_KID'), // todo are there others? Make a named enum
  currency: Currency3,
  exchange: ExchangeCode,
  industry: optional(string()),
  instrument_type: AssetClass.extract(['STK']),
  is_zero_commission_security: boolean(),
  local_symbol: string(),
  r_t_h: boolean(),
  rules: ContractRules,
  smart_available: boolean(),
  symbol: string(),
  trading_class: string(),
  underlying_con_id: integer(),
  valid_exchanges: array(ExchangeCode),
})

export interface ContractInfoSTK extends GuardType<typeof ContractInfoSTK> {}
// #endregion

// #region ContractInfoUnknown
export const ContractInfoUnknown = props({
  instrument_type: AssetClass.exclude(['STK']),
}, { extendable: true })

export interface ContractInfoUnknown extends GuardType<typeof ContractInfoUnknown> {}
// #endregion

export const ContractInfo = {
  STK: ContractInfoSTK,
  Unknown: ContractInfoUnknown,
}

export type ContractInfo = {
  STK: ContractInfoSTK
  Unknown: ContractInfoUnknown
}

export const ContractInfoUnion = union(extractValues(ContractInfo))

export type ContractInfoUnion = ContractInfo[keyof ContractInfo]
