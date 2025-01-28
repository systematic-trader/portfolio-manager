import { SaxoBankRandom } from '../saxobank-random.ts'
import type { Currency3 } from '../types/derives/currency.ts'
import type * as ETFs from './config/etf.ts'
import type {
  DataContext,
  DataContextETF,
  DataContextETFCost,
  DataContextETFSnapshot,
  DataContextReaderView,
} from './data-context.ts'
import { SaxoBankOrderUnsupportedOrderDurationError, SaxoBankOrderUnsupportedOrderTypeError } from './errors.ts'
import type { MarketSession } from './market-session.ts'
import type { SaxoBankAccount } from './saxobank-account.ts'

type ETFsType = typeof ETFs
type ETFCurrencies = keyof ETFsType

export type SaxoBankETFSymbols<Currency> = ETFsType[Currency & ETFCurrencies]['symbols'][number]

export class SaxoBankETF<
  Options extends {
    readonly symbol: string
    readonly account: { readonly accountID: string; readonly currency: Currency3 }
  },
> {
  readonly #context: DataContext
  readonly #reader: DataContextReaderView<DataContextETF>
  readonly #uic: number
  readonly #snapshot: DataContextETFSnapshot

  /** The associated account of the ETF. */
  readonly account: SaxoBankAccount<Options['account']>

  /** The symbol of the ETF. */
  readonly symbol: Options['symbol']

  readonly cost: DataContextETFCost

  /** The current session of the ETF. */
  get session(): MarketSession {
    return this.#reader.value.session
  }

  get snapshot(): DataContextETFSnapshot {
    return this.#snapshot
  }

  get lot(): DataContextETF['lot'] {
    return this.#reader.value.lot
  }

  get sum(): DataContextETF['sum'] {
    return this.#reader.value.sum
  }

  constructor(options: {
    readonly context: DataContext
    readonly etf: DataContextReaderView<DataContextETF>
    readonly account: SaxoBankAccount<Options['account']>
    readonly symbol: Options['symbol']
    readonly uic: number
    readonly cost: DataContextETFCost
    readonly snapshot: DataContextETFSnapshot
  }) {
    this.#context = options.context
    this.#reader = options.etf
    this.#uic = options.uic
    this.cost = options.cost
    this.#snapshot = options.snapshot

    this.account = options.account
    this.symbol = options.symbol
  }

  buy<
    const BuyOptions extends SaxoBankETFOrderOptions,
  >(options: BuyOptions): SaxoBankETFOrder<{
    account: Options['account']
    type: 'Buy'
    symbol: Options['symbol']
    order: Extract<{ -readonly [K in keyof BuyOptions]: BuyOptions[K] }, SaxoBankETFOrderOptions>
  }> {
    return new SaxoBankETFOrder<{
      account: Options['account']
      type: 'Buy'
      symbol: Options['symbol']
      order: Extract<{ -readonly [K in keyof BuyOptions]: BuyOptions[K] }, SaxoBankETFOrderOptions>
    }>({
      context: this.#context,
      reader: this.#reader,
      etf: this,
      uic: this.#uic,
      type: 'Buy',
      order: options as Extract<{ -readonly [K in keyof BuyOptions]: BuyOptions[K] }, SaxoBankETFOrderOptions>,
    })
  }

  sell<
    const SellOptions extends SaxoBankETFOrderOptions,
  >(options: SellOptions): SaxoBankETFOrder<{
    account: Options['account']
    type: 'Sell'
    symbol: Options['symbol']
    order: Extract<{ -readonly [K in keyof SellOptions]: SellOptions[K] }, SaxoBankETFOrderOptions>
  }> {
    return new SaxoBankETFOrder<{
      account: Options['account']
      type: 'Sell'
      symbol: Options['symbol']
      order: Extract<{ -readonly [K in keyof SellOptions]: SellOptions[K] }, SaxoBankETFOrderOptions>
    }>({
      context: this.#context,
      reader: this.#reader,
      etf: this,
      uic: this.#uic,
      type: 'Sell',
      order: options as Extract<{ -readonly [K in keyof SellOptions]: SellOptions[K] }, SaxoBankETFOrderOptions>,
    })
  }

  /**
   * Place an order to adjust the position to the target value.
   * The method will return if nothing happens with some kind of state to represent the result.
   *
   * @param value - The target value of the ETF.
   * @param block - The block size of the ETF. The order will only happen in the block size. If block is $10000, then the total value must change with $10000 or more.
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

export type SaxoBankETFOrderOptions = {
  readonly type: 'Limit'
  readonly quantity: number
  readonly limit: number
  readonly stop?: undefined
  readonly marketOffset?: undefined
  readonly stepAmount?: undefined
  readonly duration: 'GoodTillCancel' | 'Day' | 'ImmediateOrCancel' | 'FillOrKill'
} | {
  readonly type: 'Market'
  readonly quantity: number
  readonly limit?: undefined
  readonly stop?: undefined
  readonly marketOffset?: undefined
  readonly stepAmount?: undefined
  readonly duration: 'GoodTillCancel' | 'Day'
} | {
  readonly type: 'Stop'
  readonly quantity: number
  readonly limit?: undefined
  readonly stop: number
  readonly marketOffset?: undefined
  readonly stepAmount?: undefined
  readonly duration: 'GoodTillCancel' | 'Day'
} | {
  readonly type: 'StopLimit'
  readonly quantity: number
  readonly limit: number
  readonly stop: number
  readonly marketOffset?: undefined
  readonly stepAmount?: undefined
  readonly duration: 'GoodTillCancel' | 'Day'
} | {
  readonly type: 'TrailingStop'
  readonly quantity: number
  readonly limit?: undefined
  readonly stop: number
  readonly marketOffset: number
  readonly stepAmount: number
  readonly duration: 'GoodTillCancel' | 'Day'
}

export class SaxoBankETFOrder<
  Options extends {
    readonly account: { readonly accountID: string; readonly currency: Currency3 }
    readonly type: 'Buy' | 'Sell'
    readonly symbol: string
    readonly order: SaxoBankETFOrderOptions
  },
> {
  readonly #context: DataContext
  readonly #reader: DataContextReaderView<DataContextETF>
  readonly #uic: number

  readonly etf: SaxoBankETF<{ symbol: Options['symbol']; account: Options['account'] }>
  readonly ID: string
  readonly type: Options['type']
  readonly options: Options['order']
  readonly cost: number

  constructor(options: {
    readonly context: DataContext
    readonly reader: DataContextReaderView<DataContextETF>
    readonly etf: SaxoBankETF<{ symbol: Options['symbol']; account: Options['account'] }>
    readonly uic: number
    readonly type: Options['type']
    readonly order: Options['order']
  }) {
    this.#context = options.context
    this.#reader = options.reader
    this.#uic = options.uic
    this.etf = options.etf
    this.ID = SaxoBankRandom.orderID('etf')
    this.type = options.type
    this.options = options.order

    // todo hvis vi ikke har en position, men vi vil sælge, så kan vi ikke sælge
    // if (existingPositionInsufficientQuantity) {
    //   throw new Error('Bang')
    // }

    // todo hvis vi har eksisterende ordre (som stop loss eller take profit), som forhindrer salg, så kan vi ikke sælge
    // if (existingOrdersPreventSale) {
    //   throw new Error('Bang')
    // }

    const durations = this.#reader.value.orderTypes[options.order.type]

    if (durations === undefined) {
      throw new SaxoBankOrderUnsupportedOrderTypeError(
        this.etf.symbol,
        this.etf.account.currency,
        Object.keys(this.#reader.value.orderTypes),
        options.type,
      )
    }

    if (durations.includes(options.order.duration) === false) {
      throw new SaxoBankOrderUnsupportedOrderDurationError(
        this.etf.symbol,
        this.etf.account.currency,
        options.type,
        durations,
        options.order.duration,
      )
    }

    if (options.order.quantity < options.etf.lot.minimum) {
      throw new Error(`Quantity is below the minimum lot size: ${options.order} < ${options.etf.lot.minimum}`)
    }

    if (
      options.etf.lot.maximum !== undefined &&
      options.order.quantity > options.etf.lot.maximum
    ) {
      throw new Error(
        `Quantity is above the maximum lot size: ${options.order.quantity} > ${options.etf.lot.maximum}`,
      )
    }

    if (options.order.quantity % options.etf.lot.increment !== 0) {
      throw new Error(
        `Quantity is not a multiple of the lot increment: ${options.order.quantity} % ${options.etf.lot.increment} = ${
          options.order.quantity % options.etf.lot.increment
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
      ? options.etf.snapshot.quote.ask.price
      : options.etf.snapshot.quote.bid.price

    const expectedSum = pricePerQuantity * options.order.quantity

    if (options.etf.sum.minimum !== undefined && expectedSum < options.etf.sum.minimum) {
      throw new Error(`Sum is below the minimum: ${expectedSum} < ${options.etf.sum.minimum}`)
    }

    if (options.etf.sum.maximum !== undefined && expectedSum > options.etf.sum.maximum) {
      throw new Error(`Sum is above the maximum: ${expectedSum} > ${options.etf.sum.maximum}`)
    }

    // TODO "additionalCommission" might irrelevant for all exchanges
    // If relevant, then we need to know where to add it
    // 1. Should it be added as now
    // 2. Should it be added AFTER "maximum" is calculated
    // 3. ???

    this.cost = Math.max(
      this.etf.cost[options.type].minimum,
      this.etf.cost[options.type].additionalCommission +
        this.etf.cost[options.type].costPerShareCommission * options.order.quantity +
        this.etf.cost[options.type].percentageCommission * pricePerQuantity * options.order.quantity,
    )

    const costMaximum = this.etf.cost[options.type].maximum

    if (costMaximum !== undefined) {
      this.cost = Math.min(this.cost, costMaximum)
    }
  }

  async execute(): Promise<unknown> {
    const unknown = await this.#context.etfOrder({ uic: this.#uic, order: this })

    return unknown
  }
}
