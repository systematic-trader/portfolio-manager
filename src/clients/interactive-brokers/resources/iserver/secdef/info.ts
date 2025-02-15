import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import type { ExchangeCode } from '../../../types/derived/exchange-code.ts'
import type { SecurityType } from '../../../types/record/security-type.ts'

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
    readonly secType?: undefined | SecurityType

    /** Expiration month for the given derivative. */
    // todo probably only relevant for options and futures
    readonly month?: undefined | never // todo

    /** Designate the exchange you wish to receive information for in relation to the contract */
    readonly exchange?: undefined | ExchangeCode

    /** Set the strike price for the requested contract details */
    // todo probably only relevant for options
    readonly strike?: undefined | never // todo

    /**
     * Set the right for the given contract.
     * C - for Call options.
     * P - for Put options.
     */
    // todo probably only relevant for options
    readonly right?: 'C' | 'P' // todo

    /** Set the issuerId for the given bond issuer type */
    readonly issuerid?: undefined | string

    /** Comma separated list of additional filters. Applicable when SecTyp is BOND */
    // todo probably only relevant for bonds
    readonly filterd?: undefined | never
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    return await this.#client.get({
      searchParams: parameters,
      guard: undefined, // todo write a guard for this
      signal,
      timeout,
    })
  }
}
