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

  #calculateCost(type: 'buy' | 'sell', quantity: number, price: number): number {
    // TODO "additionalCommission" might irrelevant for all exchanges
    // If relevant, then we need to know where to add it
    // 1. Should it be added as now
    // 2. Should it be added AFTER "maximum" is calculated
    // 3. ???

    const cost = Math.max(
      this.cost[type].minimum,
      this.cost[type].additionalCommission +
        this.cost[type].costPerShareCommission * quantity +
        this.cost[type].percentageCommission * price * quantity,
    )

    if (this.cost[type].maximum !== undefined) {
      return Math.min(cost, this.cost[type].maximum)
    }

    return cost
  }

  #assertOrderType(options: SaxoBankStockOrderOptions): void {
    const durations = this.#reader.value.orderTypes[options.type]

    if (durations === undefined) {
      throw new SaxoBankOrderUnsupportedOrderTypeError(
        this.symbol,
        this.account.currency,
        Object.keys(this.#reader.value.orderTypes),
        options.type,
      )
    }

    if (durations.includes(options.duration) === false) {
      throw new SaxoBankOrderUnsupportedOrderDurationError(
        this.symbol,
        this.account.currency,
        options.type,
        durations,
        options.duration,
      )
    }
  }

  buy<
    const BuyOptions extends SaxoBankStockOrderOptions,
  >(options: BuyOptions): SaxoBankStockOrder<{
    account: Options['account']
    type: 'Buy'
    symbol: Options['symbol']
    order: Extract<{ -readonly [K in keyof BuyOptions]: BuyOptions[K] }, SaxoBankStockOrderOptions>
  }> {
    this.#assertOrderType(options)

    const roundedLimit = 'limit' in options && options.limit !== undefined
      ? this.#reader.value.roundPriceToTickSize(options.limit)
      : undefined

    const price = roundedLimit ?? this.#reader.value.roundPriceToTickSize(this.snapshot.quote.ask.price)
    const cost = this.#calculateCost('buy', options.quantity, price)
    const order = { ...options, limit: roundedLimit } as Extract<
      { -readonly [K in keyof BuyOptions]: BuyOptions[K] },
      SaxoBankStockOrderOptions
    >

    return new SaxoBankStockOrder<{
      account: Options['account']
      type: 'Buy'
      symbol: Options['symbol']
      order: Extract<{ -readonly [K in keyof BuyOptions]: BuyOptions[K] }, SaxoBankStockOrderOptions>
    }>({
      context: this.#context,
      stock: this,
      uic: this.#uic,
      symbol: this.symbol,
      type: 'Buy',
      cost,
      order,
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
    this.#assertOrderType(options)

    const roundedLimit = 'limit' in options && options.limit !== undefined
      ? this.#reader.value.roundPriceToTickSize(options.limit)
      : undefined

    const price = roundedLimit ?? this.#reader.value.roundPriceToTickSize(this.snapshot.quote.bid.price)
    const cost = this.#calculateCost('sell', options.quantity, price)
    const order = { ...options, limit: roundedLimit } as Extract<
      { -readonly [K in keyof SellOptions]: SellOptions[K] },
      SaxoBankStockOrderOptions
    >

    return new SaxoBankStockOrder<{
      account: Options['account']
      type: 'Sell'
      symbol: Options['symbol']
      order: Extract<{ -readonly [K in keyof SellOptions]: SellOptions[K] }, SaxoBankStockOrderOptions>
    }>({
      context: this.#context,
      stock: this,
      uic: this.#uic,
      symbol: this.symbol,
      type: 'Sell',
      cost,
      order,
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

type SaxoBankStockOrderOptions = {
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

export class SaxoBankStockOrder<
  Options extends {
    readonly account: { readonly accountID: string; readonly currency: Currency3 }
    readonly type: 'Buy' | 'Sell'
    readonly symbol: string
    readonly order: SaxoBankStockOrderOptions
  },
> {
  readonly #context: DataContext
  readonly #uic: number

  readonly stock: SaxoBankStock<{
    symbol: Options['symbol']
    account: Options['account']
  }>

  readonly ID: string = SaxoBankRandom.orderID('stock')
  readonly symbol: Options['symbol']
  readonly type: Options['type']
  readonly cost: number
  readonly options: Options['order']

  constructor(options: {
    readonly context: DataContext
    readonly stock: SaxoBankStock<{
      symbol: Options['symbol']
      account: Options['account']
    }>
    readonly uic: number
    readonly type: Options['type']
    readonly symbol: Options['symbol']
    readonly cost: number
    readonly order: Options['order']
  }) {
    this.#context = options.context
    this.stock = options.stock
    this.#uic = options.uic
    this.symbol = options.symbol
    this.type = options.type
    this.cost = options.cost
    this.options = options.order

    // if (options.order.quantity < this.lot.minimum) {
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
