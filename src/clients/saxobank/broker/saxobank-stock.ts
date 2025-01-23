import { SaxoBankRandom } from '../saxobank-random.ts'
import type { Currency3 } from '../types/derives/currency.ts'
import type * as Stocks from './config/stocks.ts'
import type {
  DataContext,
  DataContextReaderView,
  DataContextStock,
  DataContextStockCost,
  DataContextStockSnapshot,
} from './data-context.ts'
import { SaxoBankOrderUnsupportedOrderDurationError, SaxoBankOrderUnsupportedOrderTypeError } from './errors.ts'
import type { MarketSession } from './market-session.ts'
import type { SaxoBankAccount } from './saxobank-account.ts'

type StocksType = typeof Stocks
type StockCurrencies = keyof StocksType

export type SaxoBankStockSymbols<Currency> = InstanceType<StocksType[Currency & StockCurrencies]>['symbols'][number]

export class SaxoBankStock<
  Options extends {
    readonly symbol: string
    readonly account: { readonly accountID: string; readonly currency: Currency3 }
  },
> {
  readonly #context: DataContext
  readonly #reader: DataContextReaderView<DataContextStock>
  readonly #uic: number
  readonly #snapshot: DataContextStockSnapshot

  /** The associated account of the stock. */
  readonly account: SaxoBankAccount<Options['account']>

  /** The symbol of the stock. */
  readonly symbol: Options['symbol']

  readonly cost: DataContextStockCost

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
    readonly uic: number
    readonly cost: DataContextStockCost
    readonly snapshot: DataContextStockSnapshot
  }) {
    this.#context = options.context
    this.#reader = options.stock
    this.#uic = options.uic
    this.cost = options.cost
    this.#snapshot = options.snapshot

    this.account = options.account
    this.symbol = options.symbol
  }

  buy<
    const BuyOptions extends SaxoBankStockOrderOptions,
  >(options: BuyOptions): SaxoBankStockOrder<{
    account: Options['account']
    type: 'Buy'
    symbol: Options['symbol']
    order: Extract<{ -readonly [K in keyof BuyOptions]: BuyOptions[K] }, SaxoBankStockOrderOptions>
  }> {
    return new SaxoBankStockOrder<{
      account: Options['account']
      type: 'Buy'
      symbol: Options['symbol']
      order: Extract<{ -readonly [K in keyof BuyOptions]: BuyOptions[K] }, SaxoBankStockOrderOptions>
    }>({
      context: this.#context,
      reader: this.#reader,
      stock: this,
      uic: this.#uic,
      type: 'Buy',
      order: options as Extract<{ -readonly [K in keyof BuyOptions]: BuyOptions[K] }, SaxoBankStockOrderOptions>,
    })
  }

  sell<
    const SellOptions extends SaxoBankStockOrderOptions,
  >(options: SellOptions): SaxoBankStockOrder<{
    account: Options['account']
    type: 'Sell'
    symbol: Options['symbol']
    order: Extract<{ -readonly [K in keyof SellOptions]: SellOptions[K] }, SaxoBankStockOrderOptions>
  }> {
    return new SaxoBankStockOrder<{
      account: Options['account']
      type: 'Sell'
      symbol: Options['symbol']
      order: Extract<{ -readonly [K in keyof SellOptions]: SellOptions[K] }, SaxoBankStockOrderOptions>
    }>({
      context: this.#context,
      reader: this.#reader,
      stock: this,
      uic: this.#uic,
      type: 'Sell',
      order: options as Extract<{ -readonly [K in keyof SellOptions]: SellOptions[K] }, SaxoBankStockOrderOptions>,
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

export type SaxoBankStockOrderOptions = {
  readonly type: 'Limit'
  readonly quantity: number
  readonly limit: number
  readonly stop?: undefined
  readonly marketOffset?: undefined
  readonly stepAmount?: undefined
  readonly duration: 'Day' | 'GoodTillCancel' | 'ImmediateOrCancel'
} | {
  readonly type: 'Market'
  readonly quantity: number
  readonly limit?: undefined
  readonly stop?: undefined
  readonly marketOffset?: undefined
  readonly stepAmount?: undefined
  readonly duration: 'Day' | 'GoodTillCancel' | 'ImmediateOrCancel'
} | {
  readonly type: 'Stop'
  readonly quantity: number
  readonly limit?: undefined
  readonly stop: number
  readonly marketOffset?: undefined
  readonly stepAmount?: undefined
  readonly duration: 'Day' | 'GoodTillCancel' | 'ImmediateOrCancel'
} | {
  readonly type: 'StopLimit'
  readonly quantity: number
  readonly limit: number
  readonly stop: number
  readonly marketOffset?: undefined
  readonly stepAmount?: undefined
  readonly duration: 'Day' | 'GoodTillCancel' | 'ImmediateOrCancel'
} | {
  readonly type: 'TrailingStop'
  readonly quantity: number
  readonly limit?: undefined
  readonly stop: number
  readonly marketOffset: number
  readonly stepAmount: number
  readonly duration: 'Day' | 'GoodTillCancel' | 'ImmediateOrCancel'
}

export class SaxoBankStockOrder<
  Options extends {
    readonly account: { readonly accountID: string; readonly currency: Currency3 }
    readonly type: 'Buy' | 'Sell'
    readonly symbol: string
    readonly order: SaxoBankStockOrderOptions
  },
> {
  readonly #context: DataContext
  readonly #reader: DataContextReaderView<DataContextStock>
  readonly #uic: number

  readonly stock: SaxoBankStock<{ symbol: Options['symbol']; account: Options['account'] }>
  readonly ID: string
  readonly type: Options['type']
  readonly options: Options['order']
  readonly cost: number

  constructor(options: {
    readonly context: DataContext
    readonly reader: DataContextReaderView<DataContextStock>
    readonly stock: SaxoBankStock<{
      symbol: Options['symbol']
      account: Options['account']
    }>
    readonly uic: number
    readonly type: Options['type']
    readonly order: Options['order']
  }) {
    this.#context = options.context
    this.#reader = options.reader
    this.#uic = options.uic
    this.stock = options.stock
    this.ID = SaxoBankRandom.orderID('stock')
    this.type = options.type
    this.options = options.order

    const durations = this.#reader.value.orderTypes[options.order.type]

    if (durations === undefined) {
      throw new SaxoBankOrderUnsupportedOrderTypeError(
        this.stock.symbol,
        this.stock.account.currency,
        Object.keys(this.#reader.value.orderTypes),
        options.type,
      )
    }

    if (durations.includes(options.order.duration) === false) {
      throw new SaxoBankOrderUnsupportedOrderDurationError(
        this.stock.symbol,
        this.stock.account.currency,
        options.type,
        durations,
        options.order.duration,
      )
    }

    if (options.order.quantity < options.stock.lot.minimum) {
      throw new Error(`Quantity is below the minimum lot size: ${options.order} < ${options.stock.lot.minimum}`)
    }

    if (
      options.stock.lot.maximum !== undefined &&
      options.order.quantity > options.stock.lot.maximum
    ) {
      throw new Error(
        `Quantity is above the maximum lot size: ${options.order.quantity} > ${options.stock.lot.maximum}`,
      )
    }

    if (options.order.quantity % options.stock.lot.increment !== 0) {
      throw new Error(
        `Quantity is not a multiple of the lot increment: ${options.order.quantity} % ${options.stock.lot.increment} = ${
          options.order.quantity % options.stock.lot.increment
        }`,
      )
    }

    const roundedStop = 'stop' in this.options && this.options.stop !== undefined
      ? this.#reader.value.roundPriceToTickSize(this.options.stop)
      : undefined

    const roundedLimit = 'limit' in this.options && this.options.limit !== undefined
      ? this.#reader.value.roundPriceToTickSize(this.options.limit)
      : undefined

    this.options = { ...this.options, limit: roundedLimit, stop: roundedStop }

    const pricePerQuantity = roundedStop !== undefined
      ? roundedStop
      : roundedLimit !== undefined
      ? roundedLimit
      : options.type === 'Buy'
      ? options.stock.snapshot.quote.ask.price
      : options.stock.snapshot.quote.bid.price

    const expectedSum = pricePerQuantity * options.order.quantity

    if (options.stock.sum.minimum !== undefined && expectedSum < options.stock.sum.minimum) {
      throw new Error(`Sum is below the minimum: ${expectedSum} < ${options.stock.sum.minimum}`)
    }

    if (options.stock.sum.maximum !== undefined && expectedSum > options.stock.sum.maximum) {
      throw new Error(`Sum is above the maximum: ${expectedSum} > ${options.stock.sum.maximum}`)
    }

    // TODO "additionalCommission" might irrelevant for all exchanges
    // If relevant, then we need to know where to add it
    // 1. Should it be added as now
    // 2. Should it be added AFTER "maximum" is calculated
    // 3. ???

    this.cost = Math.max(
      this.stock.cost[options.type].minimum,
      this.stock.cost[options.type].additionalCommission +
        this.stock.cost[options.type].costPerShareCommission * options.order.quantity +
        this.stock.cost[options.type].percentageCommission * pricePerQuantity * options.order.quantity,
    )

    const costMaximum = this.stock.cost[options.type].maximum

    if (costMaximum !== undefined) {
      this.cost = Math.min(this.cost, costMaximum)
    }
  }

  async execute(): Promise<unknown> {
    const unknown = await this.#context.stockOrder({ uic: this.#uic, order: this })

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
