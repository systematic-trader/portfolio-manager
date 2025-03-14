import { props, string } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { assertReturn } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/src/utils/assert.ts'
import type { InteractiveBrokersResourceClient } from '../../../../resource-client.ts'
import { Currency3 } from '../../../../types/derived/currency.ts'
import { Summary } from '../summary.ts'

const BalancesResponse = props({
  'Crypto at Paxos': props({
    'MTD Interest': string(), // "0 DKK"
    cash: string(), // "0 DKK"
    equity_with_loan: string(), // "0 DKK"
    net_liquidation: string(), // "0 DKK"
    sec_gross_pos_val: string(), // "0 DKK"
  }),
  cfd: props({
    cash: string(), // "1,529,956 DKK"
    equity_with_loan: string(), // "1,529,956 DKK"
    net_liquidation: string(), // "1,529,956 DKK"
    sec_gross_pos_val: string(), // "0 DKK"
  }),
  total: props({
    'MTD Interest': string(), // "1,046 DKK"
    'Nt Lqdtn Uncrtnty': string(), // "0 DKK"
    cash: string(), // "1,732,325 DKK"
    equity_with_loan: string(), // "1,735,609 DKK"
    net_liquidation: string(), // "1,735,609 DKK"
    sec_gross_pos_val: string(), // "0 DKK"
  }),
})

/**
 * Represents the balances summary across various financial instruments.
 */
export interface BalancesSummary {
  /** The currency. */
  readonly currency: Currency3
  /** Month-to-date interest earned across all instruments. */
  readonly monthToDateInterest: number
  /** Net liquidation uncertainty. */
  readonly netLiquidationUncertainty: number
  /** Total cash balance. */
  readonly cash: number
  /** Total equity including loan amounts. */
  readonly equityWithLoan: number
  /** Total net liquidation value. */
  readonly netLiquidation: number
  /** Total gross position value of securities. */
  readonly grossPositionValue: number

  /**
   * Balances related to cryptocurrency holdings at Paxos.
   */
  readonly crypto: {
    /** Month-to-date interest earned on cryptocurrency holdings. */
    readonly monthToDateInterest: number
    /** Cash balance for cryptocurrency holdings. */
    readonly cash: number
    /** Equity including any loan amounts for cryptocurrency holdings. */
    readonly equityWithLoan: number
    /** Net liquidation value for cryptocurrency holdings. */
    readonly netLiquidation: number
    /** Gross position value of securities for cryptocurrency holdings. */
    readonly grossPositionValue: number
  }

  /**
   * Balances related to Contracts for Difference (CFD) positions.
   */
  readonly cfd: {
    /** Cash balance for CFD positions. */
    readonly cash: number
    /** Equity including any loan amounts for CFD positions. */
    readonly equityWithLoan: number
    /** Net liquidation value for CFD positions. */
    readonly netLiquidation: number
    /** Gross position value of securities for CFD positions. */
    readonly secGrossPosVal: number
  }
}

export class Balances {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  async get({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<BalancesSummary> {
    const result = await this.#client.get({
      path: `${this.#client.accountID}/summary/balances`,
      guard: BalancesResponse,
      signal,
      timeout,
    })

    const currencyPlaceholder: { value: undefined | string } = { value: undefined }

    return {
      monthToDateInterest: Summary.parseAmount(result.total['MTD Interest'], currencyPlaceholder),
      netLiquidationUncertainty: Summary.parseAmount(result.total['Nt Lqdtn Uncrtnty'], currencyPlaceholder),
      cash: Summary.parseAmount(result.total.cash, currencyPlaceholder),
      equityWithLoan: Summary.parseAmount(result.total.equity_with_loan, currencyPlaceholder),
      netLiquidation: Summary.parseAmount(result.total.net_liquidation, currencyPlaceholder),
      grossPositionValue: Summary.parseAmount(result.total.sec_gross_pos_val, currencyPlaceholder),
      crypto: {
        monthToDateInterest: Summary.parseAmount(result['Crypto at Paxos']['MTD Interest'], currencyPlaceholder),
        cash: Summary.parseAmount(result['Crypto at Paxos'].cash, currencyPlaceholder),
        equityWithLoan: Summary.parseAmount(result['Crypto at Paxos'].equity_with_loan, currencyPlaceholder),
        netLiquidation: Summary.parseAmount(result['Crypto at Paxos'].net_liquidation, currencyPlaceholder),
        grossPositionValue: Summary.parseAmount(result['Crypto at Paxos'].sec_gross_pos_val, currencyPlaceholder),
      },
      cfd: {
        cash: Summary.parseAmount(result.cfd.cash, currencyPlaceholder),
        equityWithLoan: Summary.parseAmount(result.cfd.equity_with_loan, currencyPlaceholder),
        netLiquidation: Summary.parseAmount(result.cfd.net_liquidation, currencyPlaceholder),
        secGrossPosVal: Summary.parseAmount(result.cfd.sec_gross_pos_val, currencyPlaceholder),
      },
      currency: assertReturn(Currency3, currencyPlaceholder.value),
    }
  }
}
