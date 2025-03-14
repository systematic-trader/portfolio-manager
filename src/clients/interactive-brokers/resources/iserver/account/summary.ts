import { assertReturn, format } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import { AvailableFunds } from './summary/available-funds.ts'
import { Balances } from './summary/balances.ts'
import { Margins } from './summary/margins.ts'
import { MarketValue } from './summary/market-value.ts'

const NumberValueRegex = /^\s*(-?[\d,\.]+)(?:\s+([A-Za-z]{3}))?\s*$/

export class Summary {
  static parseAmount(
    input: string,
    expectedCurrency?: undefined | { value: undefined | string },
  ): number {
    // Regex breakdown:
    // ^\s*            : Allow optional leading whitespace.
    // (-?[\d,\.]+)    : Capture group for an optional minus sign followed by one or more digits, commas, or periods.
    // (?:\s+([A-Za-z]{3}))? : Optionally capture a three-letter currency code (ignoring case).
    // \s*$            : Allow optional trailing whitespace.
    const match = input.match(NumberValueRegex)

    if (match === null) {
      if (input.trim().toLowerCase() === 'n/a') {
        return 0
      }

      throw new Error(`Expected a number but got: ${input}`)
    }

    let numericPart = match[1]

    if (numericPart === undefined) {
      throw new Error(`Expected a number but found nothing: ${input}`)
    }

    // If a comma is found, remove all commas (assuming they are thousand separators)
    if (numericPart.includes(',')) {
      numericPart = numericPart.replace(/,/g, '')
    }

    const validNumber = Number(assertReturn(format('number'), numericPart))

    // Convert any currency code to uppercase, if present.
    const currency = match[2]?.toUpperCase()

    if (currency === undefined) {
      return validNumber
    }

    if (expectedCurrency === undefined) {
      throw new Error(`Expected "expectedCurrency" to be defined`)
    }

    if (expectedCurrency.value === undefined) {
      expectedCurrency.value = currency
    } else if (expectedCurrency.value !== currency) {
      throw new Error(`Expected currency to be ${expectedCurrency.value}, but found ${currency}`)
    }

    return validNumber
  }

  readonly #client: InteractiveBrokersResourceClient

  readonly availableFunds: AvailableFunds
  readonly balances: Balances
  readonly margins: Margins
  readonly marketValue: MarketValue

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client

    this.availableFunds = new AvailableFunds(client)
    this.balances = new Balances(client)
    this.margins = new Margins(client)
    this.marketValue = new MarketValue(client)
  }

  /**
   * Provides a general overview of the account details such as balance values
   */
  async get({ signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<unknown> {
    return await this.#client.get({
      path: `${this.#client.accountID}/summary`,
      guard: undefined, // todo write guard
      signal,
      timeout,
    })
  }
}
