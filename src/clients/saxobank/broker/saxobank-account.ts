import { toArray } from '../../../utils/async-iterable.ts'
import type { Currency3 } from '../types/derives/currency.ts'
import type { DataContext, DataContextBalance, DataContextReader } from './data-context.ts'
import { mapInstrumentSessions } from './market-session.ts'
import { SaxoBankTransferCashOrder } from './saxobank-transfer-cash-order.ts'

export class SaxoBankAccount<Options extends { readonly accountID: string; readonly currency: Currency3 }> {
  readonly #context: DataContext
  readonly #balance: DataContextReader<DataContextBalance>
  readonly #currencyConversionFee: number

  /** The account ID. */
  readonly ID: Options['accountID'] // '3432432INET'

  /** The currency of the account. */
  readonly currency: Options['currency'] // Currency

  /** The cash available for trading. */
  get cash(): number {
    return this.#balance.value.cash
  }

  /** The total value of the account. */
  get total(): number {
    return this.#balance.value.total
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
    balance,
    currencyConversionFee,
    accountID,
    currency,
  }: Options & {
    readonly context: DataContext
    readonly balance: DataContextReader<DataContextBalance>
    readonly currencyConversionFee: number
  }) {
    this.#context = context
    this.#balance = balance
    this.#currencyConversionFee = currencyConversionFee
    this.ID = accountID
    this.currency = currency

    this.margin = {
      get available() {
        return balance.value.marginAvailable
      },
      get used() {
        return balance.value.marginUsed
      },
      get total() {
        return balance.value.marginTotal
      },
      get utilization() {
        return balance.value.marginUtilization
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
      throw new Error('Cannot transfer cash to the same account')
    }

    if (this.currency === currency) {
      return new SaxoBankTransferCashOrder<
        {
          from: Options
          to: { accountID: Account['ID']; currency: Account['currency'] }
          transfer: { currency: Currency; amount: Amount }
        }
      >({
        from: this,
        to,
        transfer: { currency, amount },
        rate: 1,
        session: undefined,
      })
    }

    const [fxspot] = await toArray(this.#context.app.referenceData.instruments.get({
      AssetTypes: ['FxSpot'],
      IncludeNonTradable: false,
      Keywords: [`${this.currency}${currency}`, `${currency}${this.currency}`],
      limit: 1,
    }))

    if (fxspot === undefined) {
      throw new Error(`No FX Spot (currency pair) found for ${this.currency} and ${currency}.`)
    }

    const { Quote } = await this.#context.app.trading.infoPrices.get({
      AssetType: fxspot.AssetType,
      Uic: fxspot.Identifier,
    })

    if (Quote?.Ask === undefined || Quote?.Bid === undefined) {
      throw new Error(`No FX Spot quote found for ${fxspot.Symbol}.`)
    }

    const midprice = (Quote.Bid + Quote.Ask) / 2

    const rate = (this.currency === fxspot.Symbol.slice(0, this.currency.length) ? midprice : 1 / midprice) *
      (1 - this.#currencyConversionFee)

    const [instrumentDetails] = await toArray(this.#context.app.referenceData.instruments.details.get({
      AssetTypes: ['FxSpot'],
      Uics: [fxspot.Identifier],
    }))

    if (instrumentDetails === undefined) {
      throw new Error(`No FX Spot details found for ${fxspot.Symbol}.`)
    }

    const session = mapInstrumentSessions(instrumentDetails)

    return new SaxoBankTransferCashOrder<
      {
        from: Options
        to: { accountID: Account['ID']; currency: Account['currency'] }
        transfer: { currency: Currency; amount: Amount }
      }
    >({
      from: this,
      to,
      transfer: { currency, amount },
      rate,
      session,
    })
  }
}
