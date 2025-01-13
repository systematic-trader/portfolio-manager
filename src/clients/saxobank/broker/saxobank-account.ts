import type { Currency3 } from '../types/derives/currency.ts'
import type { DataContext, DataContextAccount, DataContextReader } from './data-context.ts'
import { mapInstrumentSessions, type MarketSessionOpened } from './market-session.ts'
import { SaxoBankTransferCashOrder } from './saxobank-transfer-cash-order.ts'

const AlwaysOpenSession: MarketSessionOpened = {
  state: 'Open',
  reason: 'SameCurrencyAlwaysOpen',
  executable: true,
  startTime: '1920-01-01T00:00:00.000Z',
  endTime: '2100-01-01T00:00:00.000Z',
  next: {
    state: 'Closed',
    reason: 'VeryFarInTheFuture',
    executable: false,
    startTime: '2100-01-01T00:00:00.000Z',
    endTime: '2100-01-01T00:00:00.000Z',
    next: undefined,
  },
}

export class SaxoBankAccount<Options extends { readonly accountID: string; readonly currency: Currency3 }> {
  readonly #context: DataContext
  readonly #account: DataContextReader<DataContextAccount>
  readonly #currencyConversionFee: number

  /** The internal SaxoBank identifier */
  get key(): string {
    return this.#account.value.key
  }

  /** The account ID. */
  get ID(): Options['accountID'] { // '3432432INET'
    return this.#account.value.ID
  }

  /** The currency of the account. */
  get currency(): Options['currency'] { // Currency
    return this.#account.value.currency
  }

  /** The cash available for trading. */
  get cash(): number {
    return this.#account.value.balance.cash
  }

  /** The total value of the account. */
  get total(): number {
    return this.#account.value.balance.total
  }

  /** The margin of the account. */
  readonly margin: {
    /** The margin available for trading. */
    readonly available: number
    /** The margin used for trading. */
    readonly used: number
    /** The total margin value. */
    readonly total: number
    /** The margin utilization. */
    readonly utilization: number
  }

  constructor({
    context,
    account,
    currencyConversionFee,
  }: {
    readonly context: DataContext
    readonly account: DataContextReader<DataContextAccount>
    readonly currencyConversionFee: number
  }) {
    this.#context = context
    this.#account = account
    this.#currencyConversionFee = currencyConversionFee

    this.margin = {
      get available() {
        return account.value.balance.marginAvailable
      },
      get used() {
        return account.value.balance.marginUsed
      },
      get total() {
        return account.value.balance.marginTotal
      },
      get utilization() {
        return account.value.balance.marginUtilization
      },
    }
  }

  async transfer<
    Account extends SaxoBankAccount<{ accountID: string; currency: Currency3 }>,
    Currency extends Options['currency'] | Account['currency'],
    Amount extends number,
  >({
    to,
    currency,
    amount,
  }: {
    readonly to: Account
    readonly currency: Currency
    readonly amount: Amount
  }): Promise<
    SaxoBankTransferCashOrder<{
      from: { accountID: Options['accountID']; currency: Options['currency'] }
      to: { accountID: Account['ID']; currency: Account['currency'] }
      transfer: { currency: Currency; amount: Amount }
    }>
  > {
    if (this.ID === to.ID) {
      throw new Error('It does not make sense to transfer cash to the same account.')
    }

    if (amount <= 0) {
      throw new Error('The amount must be greater than zero.')
    }

    if (this.currency === to.currency) {
      return new SaxoBankTransferCashOrder<
        {
          from: Options
          to: { accountID: Account['ID']; currency: Account['currency'] }
          transfer: { currency: Currency; amount: Amount }
        }
      >({
        context: this.#context,
        session: AlwaysOpenSession,
        transfer: { currency, amount },
        from: { account: this, withdraw: amount, commission: 0 },
        to: { account: to, deposit: amount },
        rate: 1,
      })
    }

    const fxspot = await this.#context.instrumentFirstMatch({
      assetType: 'FxSpot',
      symbols: [`${this.currency}${to.currency}`, `${to.currency}${this.currency}`],
    })

    const quote = await this.#context.quoteSnapshot({
      assetType: 'FxSpot',
      uic: fxspot.value.Uic,
    })

    const middlePrice = (quote.ask.price + quote.bid.price) / 2

    const rate = this.currency === fxspot.value.Symbol.slice(0, this.currency.length) ? middlePrice : 1 / middlePrice

    return new SaxoBankTransferCashOrder<
      {
        from: Options
        to: { accountID: Account['ID']; currency: Account['currency'] }
        transfer: { currency: Currency; amount: Amount }
      }
    >({
      context: this.#context,
      session: mapInstrumentSessions(fxspot.value),
      transfer: { currency, amount },
      from: {
        account: this,
        withdraw: this.currency === currency ? amount : amount * rate,
        commission: (this.currency === currency ? amount : amount * rate) * this.#currencyConversionFee,
      },
      to: {
        account: to,
        deposit: to.currency === currency ? amount : amount / rate,
      },
      rate,
    })
  }

  // /**
  //  * Get a stock available for the account.
  //  * @param symbol - The symbol of the stock.
  //  * @returns The stock.
  //  */
  // async stock<
  //   Symbol extends StockSymbols<Options['currency']>,
  // >(symbol: Symbol): Promise<
  //   SaxoBankStock<{
  //     symbol: Symbol
  //     account: { accountID: Options['accountID']; currency: Options['currency'] }
  //   }>
  // > {
  //   const uic = SaxoBankStock.uic(this.currency, symbol)

  //   const stock = new SaxoBankStock<{
  //     symbol: Symbol
  //     account: { accountID: Options['accountID']; currency: Options['currency'] }
  //   }>({
  //     context: this.#context,
  //     account: this,
  //     symbol,
  //   })

  //   return stock
  // }
}
