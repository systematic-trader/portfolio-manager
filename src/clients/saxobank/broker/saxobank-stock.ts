import { SaxoBankRandom } from '../saxobank-random.ts'
import type { Currency3 } from '../types/derives/currency.ts'
import * as Stocks from './config/stocks.ts'
import type { DataContext, DataContextReaderView, DataContextStock, DataContextStockSnapshot } from './data-context.ts'
import type { MarketSession } from './market-session.ts'
import type { SaxoBankAccount } from './saxobank-account.ts'

type StocksType = typeof Stocks
type StockCurrencies = keyof StocksType
type StockOrderTypes<Currency, Symbol> = InstanceType<StocksType[Currency & StockCurrencies]> extends infer C
  ? C[Symbol & keyof C] extends new (...args: unknown[]) => {
    readonly orderTypes: infer OrderTypes
  } ? Extract<OrderTypes, Record<string, readonly string[]>>
  : never
  : never

export type SaxoBankStockSymbols<Currency> = keyof InstanceType<StocksType[Currency & StockCurrencies]> & string

export interface SaxoBankStockConfig<OrderTypes extends Record<string, readonly string[]>> {
  readonly uic: number
  readonly orderTypes: OrderTypes
}

export class SaxoBankStock<
  Options extends {
    readonly symbol: string
    readonly account: { readonly accountID: string; readonly currency: Currency3 }
  },
> {
  static config<Currency extends Currency3, Symbol extends string>(
    currency: Currency,
    symbol: Symbol,
  ): SaxoBankStockConfig<StockOrderTypes<Currency, Symbol>> {
    // deno-lint-ignore no-explicit-any
    const stocksIndex = Stocks as Record<keyof any, any>

    if (currency in stocksIndex) {
      const symbolsIndex = new stocksIndex[currency]()

      if (symbol in symbolsIndex) {
        return new symbolsIndex[symbol]()
      }
    }

    throw new Error(`Stock "${symbol}" config not found for currency "${currency}"`)
  }

  readonly #context: DataContext
  readonly #reader: DataContextReaderView<DataContextStock>
  readonly #config: { readonly uic: number; readonly orderTypes: Record<string, readonly string[]> }
  readonly #snapshot: DataContextStockSnapshot

  /** The associated account of the stock. */
  readonly account: SaxoBankAccount<Options['account']>

  /** The symbol of the stock. */
  readonly symbol: Options['symbol']

  /** The current session of the stock. */
  get session(): MarketSession {
    return this.#reader.value.session
  }

  get snapshot(): DataContextStockSnapshot {
    return this.#snapshot
  }

  get lot(): DataContextStock['lot'] {
    return this.#reader.value.lot
  }

  get sum(): DataContextStock['sum'] {
    return this.#reader.value.sum
  }

  constructor(options: {
    readonly context: DataContext
    readonly stock: DataContextReaderView<DataContextStock>
    readonly account: SaxoBankAccount<Options['account']>
    readonly symbol: Options['symbol']
    readonly config: { readonly uic: number; readonly orderTypes: Record<string, readonly string[]> }
    readonly snapshot: DataContextStockSnapshot
  }) {
    this.#context = options.context
    this.#reader = options.stock
    this.#config = options.config
    this.#snapshot = options.snapshot

    this.account = options.account
    this.symbol = options.symbol
  }

  buy<
    const BuyOptions extends SaxoBankStockOrderOptions<
      StockOrderTypes<Options['account']['currency'], Options['symbol']>
    >,
  >(options: BuyOptions): SaxoBankStockOrder<{
    account: Options['account']
    type: 'Buy'
    symbol: Options['symbol']
    order: Extract<{ -readonly [K in keyof BuyOptions]: BuyOptions[K] }, SaxoBankStockOrderOptionsBase>
  }> {
    const roundedLimit = 'limit' in options && options.limit !== undefined
      ? this.#reader.value.roundPriceToTickSize(options.limit)
      : undefined

    return new SaxoBankStockOrder<{
      account: Options['account']
      type: 'Buy'
      symbol: Options['symbol']
      order: Extract<{ -readonly [K in keyof BuyOptions]: BuyOptions[K] }, SaxoBankStockOrderOptionsBase>
    }>({
      context: this.#context,
      internal: { uic: this.#config.uic },
      account: this.account,
      symbol: this.symbol,
      type: 'Buy',
      order: { ...options, limit: roundedLimit } as Extract<
        { -readonly [K in keyof BuyOptions]: BuyOptions[K] },
        SaxoBankStockOrderOptionsBase
      >,
    })
  }

  sell<
    const SellOptions extends SaxoBankStockOrderOptions<
      StockOrderTypes<Options['account']['currency'], Options['symbol']>
    >,
  >(options: SellOptions): SaxoBankStockOrder<{
    account: Options['account']
    type: 'Sell'
    symbol: Options['symbol']
    order: Extract<{ -readonly [K in keyof SellOptions]: SellOptions[K] }, SaxoBankStockOrderOptionsBase>
  }> {
    const roundedLimit = 'limit' in options && options.limit !== undefined
      ? this.#reader.value.roundPriceToTickSize(options.limit)
      : undefined

    return new SaxoBankStockOrder<{
      account: Options['account']
      type: 'Sell'
      symbol: Options['symbol']
      order: Extract<{ -readonly [K in keyof SellOptions]: SellOptions[K] }, SaxoBankStockOrderOptionsBase>
    }>({
      context: this.#context,
      internal: { uic: this.#config.uic },
      account: this.account,
      symbol: this.symbol,
      type: 'Sell',
      order: { ...options, limit: roundedLimit } as Extract<
        { -readonly [K in keyof SellOptions]: SellOptions[K] },
        SaxoBankStockOrderOptionsBase
      >,
    })
  }

  /**
   * Place an order to adjust the position to the target value.
   * The method will return if nothing happens with some kind of state to represent the result.
   *
   * @param value - The target value of the stock.
   * @param block - The block size of the stock. The order will only happen in the block size. If block is $10000, then the total value must change with $10000 or more.
   * @param tolerance.commission - The tolerance of the commission in percentage (0.01 is 1%).
   * @param tolerance.value - The tolerance of the value in percentage (1.05 is 105%), which allows the value to be up to `value * tolerance.value`.
   * @param session.allowExtendedHours - If the order should be allowed to be executed outside of the regular trading hours.
   * @param session.afterOpenMinutes - The minutes after the market opens to execute the order.
   * @param session.beforeCloseMinutes - The minutes before the market closes to execute the order.
   */
  target(
    _value: number, /* money */
    _block: number, /* money */
    _tolerance: { readonly commission: number; readonly value: number },
    _session: { allowExtendedHours: boolean; afterOpenMinutes: number; beforeCloseMinutes: number },
  ): boolean {
    if (this.session.state !== 'Open') {
      return false /* replace with "{ result: 'skipped' }" */
    }

    if (new Date(this.session.endTime).getTime() > Date.now() - 30 * 60 * 1000 /* 30 minutes */) {
      return false /* replace with "{ result: 'skipped' }" */
    }

    // ta' højde for sum.minimum og sum.maximum, samt lot.minimum og lot.maximum og lot.increment

    // det skal være orderType Market+Day
    throw new Error('Not implemented')
  }
}

type SaxoBankStockOrderOptionsBase = {
  readonly type: 'Limit'
  readonly quantity: number
  readonly limit: number
  readonly stop?: undefined
  readonly trailingOffset?: undefined
  readonly duration: 'Day' | 'GoodTillCancel' | 'GoodTillDate' | 'ImmediateOrCancel'
} | {
  readonly type: 'Market'
  readonly quantity: number
  readonly limit?: undefined
  readonly stop?: undefined
  readonly trailingOffset?: undefined
  readonly duration: 'Day' | 'GoodTillCancel' | 'GoodTillDate' | 'ImmediateOrCancel'
} | {
  readonly type: 'Stop'
  readonly quantity: number
  readonly limit?: undefined
  readonly stop: number
  readonly trailingOffset?: undefined
  readonly duration: 'Day' | 'GoodTillCancel' | 'GoodTillDate' | 'ImmediateOrCancel'
} | {
  readonly type: 'StopLimit'
  readonly quantity: number
  readonly limit: number
  readonly stop: number
  readonly trailingOffset?: undefined
  readonly duration: 'Day' | 'GoodTillCancel' | 'GoodTillDate' | 'ImmediateOrCancel'
} | {
  readonly type: 'TrailingStop'
  readonly quantity: number
  readonly limit?: undefined
  readonly stop?: undefined
  readonly trailingOffset: number
  readonly duration: 'Day' | 'GoodTillCancel' | 'GoodTillDate' | 'ImmediateOrCancel'
}

type SaxoBankStockOrderOptions<OrderTypes extends Record<string, readonly string[]>> = {
  [K in keyof OrderTypes]:
    | (K extends 'Limit' ? {
        readonly type: 'Limit'
        readonly quantity: number
        readonly limit: number
        readonly stop?: undefined
        readonly trailingOffset?: undefined
        readonly duration: OrderTypes[K][number]
      }
      : never)
    | (K extends 'Market' ? {
        readonly type: 'Market'
        readonly quantity: number
        readonly limit?: undefined
        readonly stop?: undefined
        readonly trailingOffset?: undefined
        readonly duration: OrderTypes[K][number]
      }
      : never)
    | (K extends 'Stop' ? {
        readonly type: 'Stop'
        readonly quantity: number
        readonly limit?: undefined
        readonly stop: number
        readonly trailingOffset?: undefined
        readonly duration: OrderTypes[K][number]
      }
      : never)
    | (K extends 'StopLimit' ? {
        readonly type: 'StopLimit'
        readonly quantity: number
        readonly limit: number
        readonly stop: number
        readonly trailingOffset?: undefined
        readonly duration: OrderTypes[K][number]
      }
      : never)
    | (K extends 'TrailingStop' ? {
        readonly type: 'TrailingStop'
        readonly quantity: number
        readonly limit?: undefined
        readonly stop?: undefined
        readonly trailingOffset: number
        readonly duration: OrderTypes[K][number]
      }
      : never)
}[keyof OrderTypes]

export class SaxoBankStockOrder<
  Options extends {
    readonly account: { readonly accountID: string; readonly currency: Currency3 }
    readonly type: 'Buy' | 'Sell'
    readonly symbol: string
    readonly order: SaxoBankStockOrderOptionsBase
  },
> {
  readonly #context: DataContext
  readonly internal: { readonly uic: number }

  readonly ID: string = SaxoBankRandom.orderID('stock')
  readonly symbol: Options['symbol']
  readonly type: Options['type']
  readonly account: SaxoBankAccount<Options['account']>
  readonly options: Options['order']

  constructor(options: {
    readonly context: DataContext
    readonly internal: { readonly uic: number }
    readonly type: Options['type']
    readonly symbol: Options['symbol']
    readonly account: SaxoBankAccount<Options['account']>
    readonly order: Options['order']
  }) {
    this.#context = options.context
    this.internal = options.internal
    this.symbol = options.symbol
    this.type = options.type
    this.account = options.account
    this.options = options.order

    // if (options.quantity < this.lot.minimum) {
    //   throw new Error(`Quantity is below the minimum lot size: ${options.quantity} < ${this.lot.minimum}`)
    // }

    // if (
    //   this.lot.maximum !== undefined &&
    //   options.quantity > this.lot.maximum
    // ) {
    //   throw new Error(`Quantity is above the maximum lot size: ${options.quantity} > ${this.lot.maximum}`)
    // }

    // if (options.quantity % this.lot.increment !== 0) {
    //   throw new Error(
    //     `Quantity is not a multiple of the lot increment: ${options.quantity} % ${this.lot.increment} = ${
    //       options.quantity % this.lot.increment
    //     }`,
    //   )
    // }

    // const pricePerQuantity = 'limit' in options && roundedLimit !== undefined
    //   ? roundedLimit
    //   : this.snapshot.quote.ask.price

    // const expectedSum = pricePerQuantity * options.quantity

    // // TODO - søg efter et instrument (Stock) hvor minimum er sat og skab fejlen fra SaxoBank. Det er bedre at oversætte fejl fra service end nuværende assertion før ordren er lagt.
    // if (this.sum.minimum !== undefined && expectedSum < this.sum.minimum) {
    //   throw new Error(`Sum is below the minimum: ${expectedSum} < ${this.sum.minimum}`)
    // }

    // // TODO - søg efter et instrument (Stock) hvor maximum er sat og skab fejlen fra SaxoBank. Det er bedre at oversætte fejl fra service end nuværende assertion før ordren er lagt.
    // if (this.sum.maximum !== undefined && expectedSum > this.sum.maximum) {
    //   throw new Error(`Sum is above the maximum: ${expectedSum} > ${this.sum.maximum}`)
    // }
  }

  async cost(): Promise<{
    readonly isMinimum: boolean
    readonly commission: {
      readonly open: number
      readonly turnover: number
    }
  }> {
    return await this.#context.stockOrderCost(this)
  }

  async execute(): Promise<unknown> {
    const unknown = await this.#context.stockOrder(this)

    return unknown
  }
}

// const stock = undefined as unknown as SaxoBankStock<{
//   symbol: 'AAPL:XNAS'
//   account: { accountID: '3432432INET'; currency: 'USD' }
// }>

// const order = stock.buy({
//   type: 'Market',
//   quantity: 100,
//   duration: 'GoodTillCancel',
// })
