import { assertReturn, props, string } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../../resource-client.ts'
import { Currency3 } from '../../../../types/derived/currency.ts'
import { Summary } from '../summary.ts'

const AvailableFundsResponse = props({
  'Crypto at Paxos': props({
    'Lk Ahd Avlbl Fnds': string(), // '0 DKK'
    'Lk Ahd Excss Lqdty': string(), // '0 DKK'
    'Prdctd Pst-xpry Excss': string(), // '0 DKK'
    current_available: string(), // '0 DKK'
    current_excess: string(), // '0 DKK'
    leverage: string(), // '0.00'
    overnight_available: string(), // '0 DKK'
    overnight_excess: string(), // '0 DKK'
  }),
  cfd: props({
    current_available: string(), //'1,513,248 DKK'
    current_excess: string(), // '1,513,248 DKK'
    leverage: string(), // '0.00',
  }),
  total: props({
    'Lk Ahd Avlbl Fnds': string(), // '1,556,098 DKK'
    'Lk Ahd Excss Lqdty': string(), // '1,573,123 DKK'
    'Lk Ahd Nxt Chng': string(), // '@ 14:30:00'
    'Prdctd Pst-xpry Excss': string(), // '0 DKK'
    buying_power: string(), // '10,088,317 DKK'
    current_available: string(), // '1,513,248 DKK'
    current_excess: string(), // '1,534,168 DKK'
    leverage: string(), // 'n/a'
    overnight_available: string(), // '1,513,248 DKK'
    overnight_excess: string(), // '1,534,168 DKK'
  }),
})

export interface AvailableFundsSummary {
  /** The currency in which all funds are denominated. */
  readonly currency: Currency3 // 'DKK'
  /** The buying power representing the total amount available to purchase positions. */
  readonly buyingPower: number
  /** The funds available for immediate trading. */
  readonly available: number
  /** The current excess liquidity available. */
  readonly excess: number
  /** The leverage ratio applied to positions. */
  readonly leverage: number
  /** The timestamp (HHMMSS) indicating when the estimated funds metrics will be updated. */
  readonly nextEstimatesChange: string
  /** Estimated funds metrics based on pending transactions and instrument expirations. */
  readonly estimates: {
    /** The estimated funds available after pending transactions settle. */
    readonly expectedAvailableFunds: number
    /** The estimated excess liquidity after pending transactions settle. */
    readonly expectedExcessLiquidity: number
    /** The projected excess liquidity after the expiration of relevant instruments. */
    readonly postExpiryExcess: number
  }
  /** Details of funds reserved for overnight trading positions. */
  readonly overnight: {
    /** The funds available for overnight trading. */
    readonly available: number
    /** The excess liquidity available for overnight positions. */
    readonly excess: number
  }
  /** Funds details specific to Contracts for Difference (CFD) positions. */
  readonly cfd: {
    /** The funds available for CFD positions. */
    readonly available: number
    /** The excess liquidity available for CFD positions. */
    readonly excess: number
    /** The leverage applied to CFD positions. */
    readonly leverage: number
  }
  /** Funds details specific to cryptocurrency positions. */
  readonly crypto: {
    /** The funds available for cryptocurrency positions. */
    readonly available: number
    /** The excess liquidity available for cryptocurrency positions. */
    readonly excess: number
    /** The leverage applied to cryptocurrency positions. */
    readonly leverage: number
    /** Estimated funds metrics for cryptocurrency positions based on pending transactions and instrument expirations. */
    readonly estimates: {
      /** The estimated funds available for cryptocurrency positions after pending transactions settle. */
      readonly expectedAvailableFunds: number
      /** The estimated excess liquidity for cryptocurrency positions after pending transactions settle. */
      readonly expectedExcessLiquidity: number
      /** The projected excess liquidity for cryptocurrency positions after instrument expiration. */
      readonly postExpiryExcess: number
    }
    /** Details of funds reserved for overnight cryptocurrency trading. */
    readonly overnight: {
      /** The funds available for overnight cryptocurrency trading positions. */
      readonly available: number
      /** The excess liquidity available for overnight cryptocurrency positions. */
      readonly excess: number
    }
  }
}

export class AvailableFunds {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  /**
   * Provides a summary specific for available funds giving more depth than the standard /summary endpoint.
   */
  async get({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<AvailableFundsSummary> {
    const result = await this.#client.get({
      path: `${this.#client.accountID}/summary/available_funds`,
      guard: AvailableFundsResponse,
      signal,
      timeout,
    })

    const currencyPlaceholder: { value: undefined | string } = { value: undefined }

    return {
      available: Summary.parseAmount(result.total.current_available, currencyPlaceholder),
      excess: Summary.parseAmount(result.total.current_excess, currencyPlaceholder),
      buyingPower: Summary.parseAmount(result.total.buying_power, currencyPlaceholder),
      leverage: Summary.parseAmount(result.total.leverage, currencyPlaceholder),
      nextEstimatesChange: result.total['Lk Ahd Nxt Chng'].trim().replace(/^@ /, ''),
      overnight: {
        available: Summary.parseAmount(result.total.overnight_available, currencyPlaceholder),
        excess: Summary.parseAmount(result.total.overnight_excess, currencyPlaceholder),
      },
      estimates: {
        expectedAvailableFunds: Summary.parseAmount(result.total['Lk Ahd Avlbl Fnds'], currencyPlaceholder),
        expectedExcessLiquidity: Summary.parseAmount(result.total['Lk Ahd Excss Lqdty'], currencyPlaceholder),
        postExpiryExcess: Summary.parseAmount(result.total['Prdctd Pst-xpry Excss'], currencyPlaceholder),
      },
      cfd: {
        available: Summary.parseAmount(result.cfd.current_available, currencyPlaceholder),
        excess: Summary.parseAmount(result.cfd.current_excess, currencyPlaceholder),
        leverage: Summary.parseAmount(result.cfd.leverage, currencyPlaceholder),
      },
      crypto: {
        available: Summary.parseAmount(result['Crypto at Paxos']['current_available'], currencyPlaceholder),
        excess: Summary.parseAmount(result['Crypto at Paxos']['current_excess'], currencyPlaceholder),
        leverage: Summary.parseAmount(result['Crypto at Paxos']['leverage'], currencyPlaceholder),
        estimates: {
          expectedAvailableFunds: Summary.parseAmount(result['Crypto at Paxos']['Lk Ahd Avlbl Fnds'], currencyPlaceholder),
          expectedExcessLiquidity: Summary.parseAmount(result['Crypto at Paxos']['Lk Ahd Excss Lqdty'], currencyPlaceholder),
          postExpiryExcess: Summary.parseAmount(result['Crypto at Paxos']['Prdctd Pst-xpry Excss'], currencyPlaceholder),
        },
        overnight: {
          available: Summary.parseAmount(result['Crypto at Paxos']['overnight_available'], currencyPlaceholder),
          excess: Summary.parseAmount(result['Crypto at Paxos']['overnight_excess'], currencyPlaceholder),
        },
      },
      currency: assertReturn(Currency3, currencyPlaceholder.value),
    }
  }
}
