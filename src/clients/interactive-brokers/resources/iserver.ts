import type { InteractiveBrokersResourceClient } from '../resource-client.ts'
import { Account } from './iserver/account.ts'
import { Accounts } from './iserver/accounts.ts'
import { Auth } from './iserver/auth.ts'
import { Contract } from './iserver/contract.ts'
import { Currency } from './iserver/currency.ts'
import { ExchangeRate } from './iserver/exchange-rate.ts'
import { MarketData } from './iserver/market-data.ts'
import { Questions } from './iserver/questions.ts'
import { Secdef } from './iserver/secdef.ts'

export class Iserver {
  readonly #client: InteractiveBrokersResourceClient

  readonly account: Account
  readonly accounts: Accounts
  readonly auth: Auth
  readonly contract: Contract
  readonly currency: Currency
  readonly exchangeRate: ExchangeRate
  readonly marketData: MarketData
  readonly secdef: Secdef
  readonly questions: Questions

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('iserver')

    this.account = new Account(this.#client)
    this.accounts = new Accounts(this.#client) // notice that there is "account" and "accounts" (plural)
    this.auth = new Auth(this.#client)
    this.contract = new Contract(this.#client)
    this.currency = new Currency(this.#client)
    this.exchangeRate = new ExchangeRate(this.#client)
    this.marketData = new MarketData(this.#client)
    this.secdef = new Secdef(this.#client)
    this.questions = new Questions(this.#client)
  }
}
