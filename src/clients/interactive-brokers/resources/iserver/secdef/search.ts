import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import type { SecurityType } from '../../../types/record/security-type.ts'

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
    readonly secType?: undefined | Extract<SecurityType, 'STK' | 'IND' | 'BOND'>

    /** Denotes if the symbol value is the ticker symbol or part of the company's name */
    readonly name?: undefined | boolean

    readonly more?: undefined | boolean
    readonly fund?: undefined | boolean
    readonly fundFamilyConidEx?: undefined | string
    readonly pattern?: undefined | boolean
    readonly referrer?: undefined | string
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    return await this.#client.post({
      body: parameters,
      guard: undefined, // todo write a guard for this
      signal,
      timeout,
    })
  }
}
