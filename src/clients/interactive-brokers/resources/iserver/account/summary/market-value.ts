import { assertReturn, is, props, record, string } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../../resource-client.ts'
import { Currency3 } from '../../../../types/derived/currency.ts'
import { Summary } from '../summary.ts'

const MarketValueEntry = props({
  Cryptocurrency: string(), // "0",
  'Exchange Rate': string(), // '1.00',
  'Govt Bonds': string(), // '2,235',
  'MTD Interest': string(), // '1,046',
  'Notional CFD': string(), // '0',
  bonds: string(), // '0',
  cfd: string(), // '0',
  commodity: string(), // '0',
  dividends_receivable: string(), // '0',
  funds: string(), // '0',
  future_options: string(), // '0',
  futures: string(), // '29,325',
  issuer_option: string(), // '0',
  money_market: string(), // '0',
  mutual_funds: string(), // '0',
  net_liquidation: string(), // '1,734,535',
  options: string(), // '0',
  realized_pnl: string(), // '-220',
  settled_cash: string(), // '1,731,254',
  stock: string(), // '0',
  t_bills: string(), // '0',
  total_cash: string(), // '1,731,254',
  unrealized_pnl: string(), // '23,919',
  warrants: string(), // '0',
})

/**
 * Represents a market value entry with various asset class values.
 */
export interface MarketValueEntry {
  /** The currency */
  readonly currency: Currency3
  /** The market value of cryptocurrency holdings. */
  readonly cryptocurrency: number
  /** The exchange rate. */
  readonly exchangeRate: number
  /** The market value of government bonds. */
  readonly governmentBonds: number
  /** The month-to-date interest. */
  readonly monthToDateInterest: number
  /** The notional CFD value. */
  readonly notionalCfd: number
  /** The market value of bonds. */
  readonly bonds: number
  /** The market value of CFD positions. */
  readonly cfd: number
  /** The market value of commodity holdings. */
  readonly commodity: number
  /** The dividends receivable. */
  readonly dividendsReceivable: number
  /** The market value of funds. */
  readonly funds: number
  /** The market value of future options. */
  readonly futureOptions: number
  /** The market value of futures. */
  readonly futures: number
  /** The market value of issuer options. */
  readonly issuerOption: number
  /** The market value of money market holdings. */
  readonly moneyMarket: number
  /** The market value of mutual funds. */
  readonly mutualFunds: number
  /** The net liquidation value. */
  readonly netLiquidation: number
  /** The market value of options. */
  readonly options: number
  /** The realized profit and loss. */
  readonly realizedPnl: number
  /** The settled cash amount. */
  readonly settledCash: number
  /** The market value of stock holdings. */
  readonly stock: number
  /** The market value of T-bills. */
  readonly tBills: number
  /** The total cash value. */
  readonly totalCash: number
  /** The unrealized profit and loss. */
  readonly unrealizedPnl: number
  /** The market value of warrants. */
  readonly warrants: number
}

const MarketValueResponse = record(string(), MarketValueEntry)

export interface MarketValueSummary extends MarketValueEntry {
  readonly positions: readonly MarketValueEntry[]
}

export class MarketValue {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  async get({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    const result = await this.#client.get({
      path: `${this.#client.accountID}/summary/market_value`,
      guard: MarketValueResponse,
      signal,
      timeout,
    })

    const entries = Object.entries(result).map(([key, value]) => {
      return [key, {
        cryptocurrency: Summary.parseAmount(value.Cryptocurrency),
        exchangeRate: Summary.parseAmount(value['Exchange Rate']),
        governmentBonds: Summary.parseAmount(value['Govt Bonds']),
        monthToDateInterest: Summary.parseAmount(value['MTD Interest']),
        notionalCfd: Summary.parseAmount(value['Notional CFD']),
        bonds: Summary.parseAmount(value.bonds),
        cfd: Summary.parseAmount(value.cfd),
        commodity: Summary.parseAmount(value.commodity),
        dividendsReceivable: Summary.parseAmount(value.dividends_receivable),
        funds: Summary.parseAmount(value.funds),
        futureOptions: Summary.parseAmount(value.future_options),
        futures: Summary.parseAmount(value.futures),
        issuerOption: Summary.parseAmount(value.issuer_option),
        moneyMarket: Summary.parseAmount(value.money_market),
        mutualFunds: Summary.parseAmount(value.mutual_funds),
        netLiquidation: Summary.parseAmount(value.net_liquidation),
        options: Summary.parseAmount(value.options),
        realizedPnl: Summary.parseAmount(value.realized_pnl),
        settledCash: Summary.parseAmount(value.settled_cash),
        stock: Summary.parseAmount(value.stock),
        tBills: Summary.parseAmount(value.t_bills),
        totalCash: Summary.parseAmount(value.total_cash),
        unrealizedPnl: Summary.parseAmount(value.unrealized_pnl),
        warrants: Summary.parseAmount(value.warrants),
      }] as [string, Omit<MarketValueEntry, 'currency'>]
    })

    const rootEntry = entries.find(([key]) => key.startsWith('Total (in '))

    const positions: MarketValueSummary['positions'] = entries
      .filter(([key]) => key.startsWith('Total (in ') === false)
      .map(([key, entry]) => {
        return {
          currency: assertReturn(Currency3, key),
          ...entry,
        }
      })

    return {
      currency: extractTotalCurrency(rootEntry?.[0] as string),
      ...rootEntry?.[1],
      positions,
    }
  }
}

const TotalCurrencyRegex = /Total \(in ([A-Z]{3})\)/

function extractTotalCurrency(input: string): undefined | Currency3 {
  const match = input.match(TotalCurrencyRegex)

  const currency = match?.[1]

  return is(Currency3)(currency) ? currency : undefined
}
