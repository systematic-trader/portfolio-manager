import {
  array,
  boolean,
  enums,
  format,
  type GuardType,
  literal,
  number,
  optional,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import { Currency3 } from '../../../types/derived/currency.ts'

export const RulesResponse = props({
  algoEligible: boolean(),
  allOrNoneEligible: boolean(),
  canTradeAcctIds: array(string()),
  cashCcy: Currency3,
  cashQtyIncr: optional(number()),
  cashSize: number(),
  costReport: boolean(),
  defaultSize: number(),
  forceOrderPreview: boolean(),
  fraqInt: number(),
  fraqTypes: optional(array(enums([
    'limit',
    'market',
    'stop',
    'stop_limit',
    'mit',
    'lit',
    'trailing_stop',
    'trailing_stop_limit',
    'relative',
  ]))),
  hasSecondary: boolean(),
  ibAlgoTypes: optional(array(enums([
    'limit',
    'stop_limit',
    'lit',
    'trailing_stop_limit',
    'relative',
    'marketonclose',
    'limitonclose',
  ]))),
  increment: number(),
  incrementDigits: number(),
  incrementRules: array(props({ increment: number(), lowerEdge: number() })),
  incrementType: number(),
  limitPrice: optional(number()),
  // modTypes is defined when "modifyOrder" is true
  modTypes: optional(array(enums([
    'limit',
    'market',
  ]))),
  negativeCapable: boolean(),
  orderDefaults: props({ LMT: props({ LP: union([literal('empty'), format('number')]) }) }),
  orderTypes: array(enums([
    'limit',
    'market',
    'stop',
    'stop_limit',
    'mit',
    'lit',
    'trailing_stop',
    'trailing_stop_limit',
    'relative',
    'midprice',
    'relative',
    'marketonclose',
    'limitonclose',
  ])),
  orderTypesOutside: optional(array(enums([
    'limit',
    'lit',
    'mit',
    'relative',
    'stop_limit',
    'stop',
    'trailing_stop_limit',
    'trailing_stop',
  ]))),
  overnightEligible: optional(boolean()),
  preview: boolean(),
  sizeIncrement: number(),
  stopprice: optional(number()),
  tifDefaults: props({ SIZE: format('number'), TIF: literal('DAY') }),
  tifTypes: array(enums([
    'DAY/o,a',
    'GTC/o,a',
    'GTD/o,a',
    'IOC/MARKET,LIMIT,RELATIVE,MARKETONCLOSE,MIDPRICE,LIMITONCLOSE,MKT_PROTECT,STPPRT,a',
    'OPG/LIMIT,MARKET,a',
  ])),
})

export interface RulesResponse extends GuardType<typeof RulesResponse> {}

export class Rules {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('rules')
  }

  /**
   * Requests contract rules for the given conid
   */
  async post({
    conid,
    isBuy,
    modifyOrder,
    orderId,
  }: {
    readonly conid: number
    readonly isBuy?: undefined | boolean
    readonly modifyOrder?: undefined | false
    readonly orderId?: undefined
  } | {
    readonly conid: number
    readonly isBuy?: undefined | boolean
    readonly modifyOrder: true
    readonly orderId: number
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<RulesResponse> {
    return await this.#client.post({
      body: { conid, isBuy, modifyOrder, orderId },
      guard: RulesResponse,
      signal,
      timeout,
    })
  }
}
