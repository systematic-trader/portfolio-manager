import {
  boolean,
  type GuardType,
  literal,
  number,
  pattern,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import { AssetClass } from '../../../types/derived/asset-class.ts'
import { Currency3 } from '../../../types/derived/currency.ts'
import { ExchangeCode } from '../../../types/derived/exchange-code.ts'

export const BondSecurityInfo = props({
  companyName: string(),
  conid: number(),
  currency: Currency3,
  exchange: ExchangeCode,
  maturityDate: pattern(/^\d{8}$/), // YYYYMMDD
  right: literal('?'),
  secType: AssetClass.extract(['BOND']),
  strike: literal(0),
  ticker: string(),
  validExchanges: string(),
})

export interface BondSecurityInfo extends GuardType<typeof BondSecurityInfo> {}

export const CashSecurityInfo = props({
  companyName: string(),
  conid: number(),
  currency: Currency3,
  exchange: ExchangeCode,
  listingExchange: ExchangeCode,
  priceRendering: number(),
  right: literal('?'),
  secType: AssetClass.extract(['CASH']),
  strike: literal(0),
  ticker: string(),
  validExchanges: string(),
})

export interface CashSecurityInfo extends GuardType<typeof CashSecurityInfo> {}

export const FutureSecurityInfo = props({
  companyName: string(),
  conid: number(),
  currency: Currency3,
  exchange: ExchangeCode,
  maturityDate: pattern(/^\d{8}$/), // YYYYMMDD
  right: literal('?'),
  secType: AssetClass.extract(['FUT']),
  showPrips: boolean(),
  strike: literal(0),
  ticker: string(),
  validExchanges: string(),
})

export interface FutureSecurityInfo extends GuardType<typeof FutureSecurityInfo> {}

export const StockContractInfo = props({
  companyName: string(),
  conid: number(),
  currency: Currency3,
  exchange: ExchangeCode,
  listingExchange: ExchangeCode,
  right: literal('?'),
  secType: AssetClass.extract(['STK']),
  strike: literal(0),
  ticker: string(),
  validExchanges: string(),
})

export interface StockContractInfo extends GuardType<typeof StockContractInfo> {}

export const SecurityInfo = union([BondSecurityInfo, CashSecurityInfo, FutureSecurityInfo, StockContractInfo])

export type SecurityInfo = GuardType<typeof SecurityInfo>

export class Info {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('info')
  }

  async get(parameters: {
    /**
     * Contract identifier of the underlying.
     * May also pass the final derivative conid directly
     */
    readonly conid: string | number

    /** Security type of the requested contract of interest */
    readonly secType?: undefined | AssetClass
    /** Expiration month for the given derivative. */
    // if specified, the symbol must be in the format "SYMBOL:CONID" - this will also change the response structure
    // readonly month?: undefined | string // looks like it must be in the format "MMMYY", e.g. "JAN25"

    /** Designate the exchange you wish to receive information for in relation to the contract */
    // readonly exchange?: undefined | ExchangeCode

    /** Set the strike price for the requested contract details */
    // readonly strike?: undefined | never // todo probably only relevant for options

    /**
     * Set the right for the given contract.
     * C - for Call options.
     * P - for Put options.
     */
    // readonly right?: 'C' | 'P' // todo probably only relevant for options

    /** Set the issuerId for the given bond issuer type */
    // readonly issuerid?: undefined | string

    /** Comma separated list of additional filters. Applicable when SecTyp is BOND */
    // readonly filterd?: undefined | never // todo probably only relevant for bonds
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<SecurityInfo> {
    return await this.#client.get({
      searchParams: parameters,
      guard: SecurityInfo,
      signal,
      timeout,
    })
  }
}
