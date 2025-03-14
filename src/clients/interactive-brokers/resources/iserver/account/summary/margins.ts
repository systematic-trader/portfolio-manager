import { assertReturn, props, string } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../../resource-client.ts'
import { Currency3 } from '../../../../types/derived/currency.ts'
import { Summary } from '../summary.ts'

const MarginsResponse = props({
  'Crypto at Paxos': props({
    'Prdctd Pst-xpry Mrgn @ Opn': string(), // '0 DKK'
    'Prjctd Lk Ahd Mntnnc Mrgn': string(), // '0 DKK'
    'Prjctd Ovrnght Mntnnc Mrgn': string(), // '0 DKK'
    current_initial: string(), // '0 DKK'
    current_maint: string(), // '0 DKK'
    projected_liquidity_inital_margin: string(), // '0 DKK'
    projected_overnight_initial_margin: string(), // '0 DKK'
  }),
  cfd: props({
    current_initial: string(), // '0 DKK'
    current_maint: string(), // '0 DKK'
  }),
  total: props({
    'Prdctd Pst-xpry Mrgn @ Opn': string(), // '0 DKK'
    'Prjctd Lk Ahd Mntnnc Mrgn': string(), // '144,861 DKK'
    'Prjctd Ovrnght Mntnnc Mrgn': string(), // '184,354 DKK'
    current_initial: string(), // '205,411 DKK'
    current_maint: string(), // '184,354 DKK'
    projected_liquidity_inital_margin: string(), // '161,966 DKK'
    projected_overnight_initial_margin: string(), // '205,411 DKK'
  }),
})
export class Margins {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  async get({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<MarginsSummary> {
    const result = await this.#client.get({
      path: `${this.#client.accountID}/summary/margins`,
      guard: MarginsResponse, // todo write guard
      signal,
      timeout,
    })

    const currencyPlaceholder: { value: undefined | string } = { value: undefined }

    return {
      initial: Summary.parseAmount(result.total.current_initial, currencyPlaceholder),
      maintenance: Summary.parseAmount(result.total.current_maint, currencyPlaceholder),
      estimates: {
        expectedPostExpiryMarginAtOpen: Summary.parseAmount(result.total['Prdctd Pst-xpry Mrgn @ Opn'], currencyPlaceholder),
        expectedLookAheadMaintenanceMargin: Summary.parseAmount(result.total['Prjctd Lk Ahd Mntnnc Mrgn'], currencyPlaceholder),
        expectedOvernightMaintenanceMargin: Summary.parseAmount(result.total['Prjctd Ovrnght Mntnnc Mrgn'], currencyPlaceholder),
        expectedLiquidityInitialMargin: Summary.parseAmount(result.total.projected_liquidity_inital_margin, currencyPlaceholder),
        expectedOvernightInitialMargin: Summary.parseAmount(result.total.projected_overnight_initial_margin, currencyPlaceholder),
      },
      cfd: {
        initial: Summary.parseAmount(result.cfd.current_initial, currencyPlaceholder),
        maintenance: Summary.parseAmount(result.cfd.current_maint, currencyPlaceholder),
      },
      crypto: {
        initial: Summary.parseAmount(result['Crypto at Paxos'].current_initial, currencyPlaceholder),
        maintenance: Summary.parseAmount(result['Crypto at Paxos'].current_maint, currencyPlaceholder),
        estimates: {
          expectedPostExpiryMarginAtOpen: Summary.parseAmount(
            result['Crypto at Paxos']['Prdctd Pst-xpry Mrgn @ Opn'],
            currencyPlaceholder,
          ),
          expectedLookAheadMaintenanceMargin: Summary.parseAmount(
            result['Crypto at Paxos']['Prjctd Lk Ahd Mntnnc Mrgn'],
            currencyPlaceholder,
          ),
          expectedLiquidityInitialMargin: Summary.parseAmount(
            result['Crypto at Paxos'].projected_liquidity_inital_margin,
            currencyPlaceholder,
          ),
          expectedOvernightMaintenanceMargin: Summary.parseAmount(
            result['Crypto at Paxos']['Prjctd Ovrnght Mntnnc Mrgn'],
            currencyPlaceholder,
          ),
          expectedOvernightInitialMargin: Summary.parseAmount(
            result['Crypto at Paxos'].projected_overnight_initial_margin,
            currencyPlaceholder,
          ),
        },
      },
      currency: assertReturn(Currency3, currencyPlaceholder.value),
    }
  }
}

/**
 * Represents the margins summary across various financial instruments.
 */
export interface MarginsSummary {
  /** The currency. */
  readonly currency: Currency3
  /** The current initial margin across all instruments. */
  readonly initial: number
  /** The current maintenance margin across all instruments. */
  readonly maintenance: number
  /** Estimated margins based on projected values. */
  readonly estimates: {
    /** The expected post-expiry margin at open. */
    readonly expectedPostExpiryMarginAtOpen: number
    /** The expected look-ahead maintenance margin. */
    readonly expectedLookAheadMaintenanceMargin: number
    /** The expected overnight maintenance margin. */
    readonly expectedOvernightMaintenanceMargin: number
    /** The expected liquidity initial margin. */
    readonly expectedLiquidityInitialMargin: number
    /** The expected overnight initial margin. */
    readonly expectedOvernightInitialMargin: number
  }
  /** Margins for Contracts for Difference (CFD) positions. */
  readonly cfd: {
    /** The current initial margin for CFD positions. */
    readonly initial: number
    /** The current maintenance margin for CFD positions. */
    readonly maintenance: number
  }

  /**
   * Margins related to cryptocurrency holdings at Paxos.
   */
  readonly crypto: {
    /** The current initial margin for cryptocurrency holdings. */
    readonly initial: number
    /** The current maintenance margin for cryptocurrency holdings. */
    readonly maintenance: number
    /**
     * Estimated margins for cryptocurrency holdings.
     */
    readonly estimates: {
      /** The expected post-expiry margin at open for cryptocurrency holdings. */
      readonly expectedPostExpiryMarginAtOpen: number
      /** The expected look-ahead maintenance margin for cryptocurrency holdings. */
      readonly expectedLookAheadMaintenanceMargin: number
      /** The expected overnight maintenance margin for cryptocurrency holdings. */
      readonly expectedOvernightMaintenanceMargin: number
      /** The expected liquidity initial margin for cryptocurrency holdings. */
      readonly expectedLiquidityInitialMargin: number
      /** The expected overnight initial margin for cryptocurrency holdings. */
      readonly expectedOvernightInitialMargin: number
    }
  }
}
