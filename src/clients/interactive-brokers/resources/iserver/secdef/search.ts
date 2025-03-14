import {
  array,
  boolean,
  enums,
  type GuardType,
  number,
  optional,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import type { AssetClass } from '../../../types/derived/asset-class.ts'
import { ExchangeCode } from '../../../types/derived/exchange-code.ts'

// todo how much different is this from "AssetClass"?
const SecurityType = enums([
  'CASH',
  'FUT',
  'FOP',
  'IOPT',
  'CFD',
  'EC',
  'BAG',
  'STK',
  'WAR',
  'BOND',
  'IND',
])

const Issuer = props({
  id: string(),
  name: string(),
})

const SectionCash = props({
  secType: SecurityType.extract(['CASH']),
})

const SectionFuture = props({
  secType: SecurityType.extract(['FUT']),
  months: string(), // e.g. "MAR25;APR25"
  exchange: ExchangeCode,
  showPrips: boolean(),
})

const SectionNotImplemented = props({
  secType: SecurityType.exclude(['CASH', 'FUT']),
}, { extendable: true })

const SectionTypes = [
  SectionCash,
  SectionFuture,
  SectionNotImplemented,
]

const Section = union(SectionTypes)

const SecuritySearchResult = props({
  companyHeader: string(),
  companyName: optional(string()),
  conid: string({ format: 'positive-integer' }),
  description: optional(string()),
  sections: array(Section),
  symbol: optional(string()),
  bondid: optional(number()),
  issuers: optional(array(Issuer)),
  restricted: optional(string()),
})

export type SecuritySearchResult = GuardType<typeof SecuritySearchResult>

export class Search {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('search')
  }

  /**
   * Returns a list of contracts based on the search symbol provided.
   */
  async post(parameters: {
    /** The ticker symbol, bond issuer type, or company name of the equity you are looking to trade */
    readonly symbol: string

    /**
     * Available underlying security types:
     *   STK - Represents an underlying as a Stock security type
     *   IND - Represents an underlying as an Index security type
     *   BOND - Represents an underlying as a Bond security type
     */
    readonly secType?: undefined | Extract<AssetClass, 'STK' | 'IND' | 'BOND'>

    /** Denotes if the symbol value is the ticker symbol or part of the company's name */
    readonly name?: undefined | boolean

    // Specifying more: true will return a http 503 response unless the symbol is formatted as SYMBOL:CONTRACT_ID
    readonly more?: undefined | boolean

    readonly fund?: undefined | boolean
    readonly fundFamilyConidEx?: undefined | string
    readonly pattern?: undefined | boolean
    readonly referrer?: undefined | string
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<readonly SecuritySearchResult[]> {
    const results = await this.#client.post({
      body: parameters,
      guard: optional(array(SecuritySearchResult)),
      signal,
      timeout,
    })

    return results ?? []
  }
}
