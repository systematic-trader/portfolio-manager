import {
  array,
  type GuardType,
  number,
  optional,
  props,
  record,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../resource-client.ts'
import type { ExchangeCode } from '../../types/derived/exchange-code.ts'

export const Future = props({
  conid: number(),
  expirationDate: number(),
  longFuturesCutOff: number(),
  ltd: number(),
  shortFuturesCutOff: number(),
  symbol: string(),
  underlyingConid: number(),
})

export interface Future extends GuardType<typeof Future> {}

export const FuturesResponse = record(string(), optional(array(Future)))

export type FuturesResponse<T extends string = string> = Record<T, undefined | ReadonlyArray<Future>>

export class Futures {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('futures')
  }

  async get<const Symbols extends readonly string[]>(
    { symbols, exchange }: { readonly symbols: Symbols; readonly exchange?: undefined | ExchangeCode },
    { timeout, signal }: { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal } = {},
  ): Promise<FuturesResponse<Symbols[number]>> {
    const result = await this.#client.get({
      searchParams: {
        symbols: symbols.join(','),
        exchange,
      },
      guard: optional(FuturesResponse),
      signal,
      timeout,
    })

    if (result === undefined) {
      return {} as FuturesResponse<Symbols[number]>
    }

    return result as FuturesResponse<Symbols[number]>
  }
}
