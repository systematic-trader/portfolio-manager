import { toArray } from '../../../utils/async-iterable.ts'
import { Timeout } from '../../../utils/timeout.ts'
import type { SaxoBankApplication } from '../../saxobank-application.ts'
import type {
  PlaceOrderParametersEntryWithNoRelatedOrders,
  PlaceOrderResponse,
} from '../service-groups/trading/orders.ts'
import type { AssetType } from '../types/derives/asset-type.ts'
import type { InstrumentSessionState } from '../types/derives/instrument-session-state.ts'
import type { PlaceableOrderType } from '../types/derives/placeable-order-type.ts'
import type { AccountResponse } from '../types/records/account-response.ts'
import type { ClientResponse } from '../types/records/client-response.ts'
import type { InfoPriceResponse } from '../types/records/info-price-response.ts'
import type {
  InstrumentDetails,
  InstrumentDetailsFxForwards,
  InstrumentDetailsStock,
  InstrumentDetailsUnion,
} from '../types/records/instrument-details.ts'
import type { TickSizeScheme } from '../types/records/tick-size-scheme.ts'

const PORTFOLIO_RATE_LIMIT_ESTIMATES = {
  // this is a bit more than the rate limit of 240 requests per minute
  delay: 300,
  timeout: 80_000,
}

type NumericCondition = readonly ['>' | '≥' | '=' | '≤' | '<', number]

type ClientKeyArgument = undefined | string | (() => Promise<string>)

export class TestingUtilities {
  #app: SaxoBankApplication

  constructor({ app }: {
    readonly app: SaxoBankApplication
  }) {
    this.#app = app
    this.getFirstClient = this.getFirstClient.bind(this)
    this.getFirstAccount = this.getFirstAccount.bind(this)
    this.resetSimulationAccount = this.resetSimulationAccount.bind(this)
    this.waitForPortfolioState = this.waitForPortfolioState.bind(this)
    this.findTradableInstruments = this.findTradableInstruments.bind(this)
    this.getPrice = this.getPrice.bind(this)
    this.roundPriceToInstrumentSpecification = this.roundPriceToInstrumentSpecification.bind(this)
  }

  #clientCached: Promise<ClientResponse> | undefined
  async getFirstClient(): Promise<ClientResponse> {
    if (this.#clientCached === undefined) {
      this.#clientCached = toArray(this.#app.portfolio.clients.get()).then(([client]) => {
        if (client === undefined) {
          throw new Error('No clients returned from portfolio endpoint')
        }
        return client
      })
    }

    return await this.#clientCached
  }

  #accountCached: Promise<AccountResponse> | undefined
  async getFirstAccount(): Promise<AccountResponse> {
    if (this.#accountCached === undefined) {
      this.#accountCached = toArray(this.#app.portfolio.accounts.get()).then(([account]) => {
        if (account === undefined) {
          throw new Error('No accounts returned from portfolio endpoint')
        }
        return account
      })
    }

    return await this.#accountCached
  }

  /**
   * Resets a simulation account.
   * This will delete any positions and orders and set the account balance to the specified value.
   */
  async resetSimulationAccount({
    app: appOverride,
    balance = 1_000_000,
  }: {
    readonly app?: undefined | SaxoBankApplication

    /**
     * The balance to reset the account to.
     * Must be within the range of 0 to 10,000,000.
     * The default is 50,000.
     */
    readonly balance?: undefined | number
  } = {}): Promise<void> {
    const app = appOverride ?? this.#app

    const { AccountKey } = await this.getFirstAccount()

    await app.portfolio.accounts.account.reset.put({
      AccountKey,
      NewBalance: balance,
    })
  }

  /**
   * Wait for the portfolio to reach the specified state.
   * This will poll the endpoints continiously until the state matches the specified values.
   * This is useful when you need to wait for orders to be filled.
   */
  async waitForPortfolioState(
    {
      app: appOverride,
      clientKey: clientKeyOverride,
      orders,
      positions,
      delay = PORTFOLIO_RATE_LIMIT_ESTIMATES.delay,
      timeout = PORTFOLIO_RATE_LIMIT_ESTIMATES.timeout,
    }:
      & {
        readonly app?: undefined | SaxoBankApplication
        readonly clientKey?: ClientKeyArgument
        readonly orders?: NumericCondition
        readonly positions?: NumericCondition
        readonly delay?: number
        readonly timeout?: number
      }
      & (
        | { readonly orders: NumericCondition }
        | { readonly positions: NumericCondition }
      ),
  ): Promise<void> {
    if (orders === undefined && positions === undefined) {
      throw new Error(`At least one of 'orders' or 'positions' must be specified.`)
    }

    const app = appOverride ?? this.#app
    const clientKey = clientKeyOverride === undefined
      ? (await this.getFirstClient()).ClientKey
      : typeof clientKeyOverride === 'function'
      ? await clientKeyOverride()
      : clientKeyOverride

    const startTime = Date.now()

    while (true) {
      const elapsed = Date.now() - startTime
      const remaining = timeout - elapsed

      if (remaining <= 0) {
        throw new Error(`Timeout waiting for portfolio state.`)
      }

      if (orders) {
        await Timeout.wait(delay)

        const currentOrders = await toArray(app.portfolio.orders.get({
          ClientKey: clientKey,
        }, {
          timeout: remaining,
        }))

        if (this.#valueMatchesCondition(currentOrders.length, orders)) {
          return
        }
      }

      if (positions) {
        await Timeout.wait(delay)

        const currentPositions = await toArray(app.portfolio.positions.get({
          ClientKey: clientKey,
        }, {
          timeout: remaining,
        }))

        if (this.#valueMatchesCondition(currentPositions.length, positions)) {
          return
        }
      }
    }
  }

  #valueMatchesCondition(value: number, [operator, target]: NumericCondition): boolean {
    switch (operator) {
      case '>':
        return value > target

      case '≥':
        return value >= target

      case '=':
        return value === target

      case '≤':
        return value <= target

      case '<':
        return value < target

      default:
        throw new Error('Unsupported operator')
    }
  }

  /**
   * Find tradable instruments for the given asset types, based on reference data.
   * Instruments that are explicitly marked as non-tradable will be excluded (either by `IsTradable` or `NonTradableReason`).
   */
  async *findTradableInstruments<T extends AssetType>({
    app: appOverride,
    assetTypes,
    uics,
    sessions,
    limit,
    supportedOrderTypes,
  }: {
    readonly app?: undefined | SaxoBankApplication
    readonly assetTypes: readonly [T, ...readonly T[]]
    readonly uics?: undefined | readonly number[]
    readonly sessions?: undefined | readonly InstrumentSessionState[]
    readonly limit?: undefined | number
    readonly supportedOrderTypes?: undefined | readonly PlaceableOrderType[]
  }): AsyncGenerator<
    Extract<InstrumentDetailsUnion, { readonly AssetType: T }>,
    void,
    undefined
  > {
    if (limit !== undefined && limit <= 0) {
      return
    }

    const app = appOverride ?? this.#app

    const instruments = app.referenceData.instruments.details.get({
      AssetTypes: assetTypes,
      Uics: uics,
    })

    let count = 0
    for await (const instrument of instruments) {
      const now = new Date().toISOString()
      const supportedOrderTypesSet = new Set(supportedOrderTypes)

      // Filter out any instruments that are not tradable
      if ('IsTradable' in instrument && instrument.IsTradable === false) {
        continue
      }
      if ('NonTradableReason' in instrument && ['None'].includes(instrument.NonTradableReason) === false) {
        continue
      }

      // Filter out any instruments, where the market is not in the specified session (e.g. open)
      if (sessions !== undefined) {
        const currentSession = instrument.TradingSessions.Sessions.find((session) => {
          return session.StartTime <= now && now <= session.EndTime
        })

        if (currentSession === undefined) {
          throw new Error(`Could not determine active session for instrument with uic ${instrument.Uic}`)
        }

        if (sessions.includes(currentSession.State) === false) {
          continue
        }
      }

      // Filter any instruments that do not support the specified order types
      if (supportedOrderTypesSet.size > 0) {
        if ('SupportedOrderTypes' in instrument === false) {
          continue // instrument does not support any order types
        }

        if (instrument.SupportedOrderTypes.every((orderType) => supportedOrderTypesSet.has(orderType) === false)) {
          continue // instrument does not support any of the specified order types
        }
      }

      yield instrument

      if (++count === limit) {
        break
      }
    }
  }

  calculateMinimumTradeSize(instrument: InstrumentDetailsUnion): number {
    const minimumTradeSize = ('MinimumTradeSize' in instrument &&
        instrument.MinimumTradeSize !== undefined &&
        instrument.MinimumTradeSize > 0)
      ? instrument.MinimumTradeSize
      : 1

    switch (instrument.AssetType) {
      case 'Bond':
      case 'CfdOnEtf':
      case 'CfdOnFutures':
      case 'CfdOnStock':
      case 'CompanyWarrant':
      case 'Etf':
      case 'Fund':
      case 'Rights':
      case 'Stock': {
        const { LotSize, MinimumLotSize } = instrument
        return Math.max(minimumTradeSize, LotSize ?? 0, MinimumLotSize ?? 0)
      }

      case 'CfdOnCompanyWarrant':
      case 'CfdOnEtc':
      case 'CfdOnEtn':
      case 'CfdOnFund':
      case 'CfdOnIndex':
      case 'CfdOnRights':
      case 'ContractFutures':
      case 'Etc':
      case 'Etn':
      case 'FuturesStrategy':
      case 'StockIndex': {
        const { MinimumLotSize } = instrument
        return Math.max(minimumTradeSize, MinimumLotSize ?? 0)
      }

      case 'FxForwards':
      case 'FxNoTouchOption':
      case 'FxOneTouchOption':
      case 'FxSpot':
      case 'FxSwap':
      case 'FxVanillaOption':
      case 'MutualFund': {
        return minimumTradeSize
      }

      default: {
        throw new Error('Unsupported asset type')
      }
    }
  }

  roundPriceToTickSize({
    price,
    tickSize,
  }: {
    readonly price: number
    readonly tickSize: number
  }): number {
    return Math.round(price / tickSize) * tickSize
  }

  roundPriceToTickScheme({
    price,
    tickSizeScheme,
  }: {
    readonly price: number
    readonly tickSizeScheme: TickSizeScheme
  }): number {
    if (tickSizeScheme.Elements === undefined) {
      return tickSizeScheme.DefaultTickSize
    }

    const tickSizesSorted = [...tickSizeScheme.Elements].sort((left, right) => right.HighPrice - left.HighPrice)
    const firstMatchingTickSize = tickSizesSorted.find((element) => price < element.HighPrice)
    const tickSize = firstMatchingTickSize?.TickSize ?? tickSizeScheme.DefaultTickSize

    return this.roundPriceToTickSize({
      price,
      tickSize,
    })
  }

  roundPriceToInstrumentSpecification({
    price,
    instrument,
  }: {
    readonly price: number
    readonly instrument: InstrumentDetailsStock
  }): number {
    // Firstly, use the tick size scheme, if provided
    if (instrument.TickSizeScheme !== undefined) {
      return this.roundPriceToTickScheme({
        price,
        tickSizeScheme: instrument.TickSizeScheme,
      })
    }

    // Otherwise use the fixed tick size
    if (instrument.TickSize !== undefined) {
      this.roundPriceToTickSize({
        price,
        tickSize: instrument.TickSize,
      })
    }

    return price
  }

  async getPrice(parameters: {
    readonly app?: undefined | SaxoBankApplication
    readonly instrument: InstrumentDetailsFxForwards
    readonly forwardDate: string
  }): Promise<{
    readonly infoPrice: InfoPriceResponse['FxForwards']
  }>

  async getPrice(parameters: {
    readonly app?: undefined | SaxoBankApplication
    readonly instrument: InstrumentDetailsStock
  }): Promise<{
    readonly infoPrice: InfoPriceResponse['Stock']
  }>

  async getPrice<AssetType extends (keyof InstrumentDetails & keyof InfoPriceResponse)>(parameters: {
    readonly app?: undefined | SaxoBankApplication
    readonly instrument: InstrumentDetails[AssetType]
    readonly forwardDate?: undefined | string
  }): Promise<{
    readonly infoPrice: InfoPriceResponse[typeof parameters.instrument.AssetType]
  }> {
    const app = parameters.app ?? this.#app

    switch (parameters.instrument.AssetType) {
      case 'Stock':
      case 'FxSpot': {
        const infoPrice = await app.trading.infoPrices.get({
          AssetType: parameters.instrument.AssetType,
          Uic: parameters.instrument.Uic,
        })

        return { infoPrice }
      }

      case 'FxForwards': {
        const infoPrice = await app.trading.infoPrices.get({
          AssetType: parameters.instrument.AssetType,
          Uic: parameters.instrument.Uic,
          ForwardDate: parameters.forwardDate,
        })

        return { infoPrice }
      }

      default: {
        throw new Error('Unsupported asset type')
      }
    }
  }

  // todo rename - we just need an easy way of placing orders for different order types
  async placeDayOrder<
    AssetType extends Exclude<
      PlaceOrderParametersEntryWithNoRelatedOrders['AssetType'],
      'StockIndexOption' | 'StockOption' | 'FuturesOption'
    >,
    Instrument extends InstrumentDetails[AssetType],
  >(parameters: {
    readonly app?: undefined | SaxoBankApplication
    readonly instrument: Instrument // todo add support for options
    readonly orderType: never
  }): Promise<PlaceOrderResponse> {
    const app = parameters.app ?? this.#app

    const amount = this.calculateMinimumTradeSize(parameters.instrument)

    switch (parameters.instrument.AssetType) {
      case 'FxForwards': {
        const [forwardDate] = await toArray(app.referenceData.standarddates.forwardTenor.get({
          Uic: parameters.instrument.Uic,
        }))

        if (forwardDate === undefined) {
          throw new Error(
            `Could not determine forward date for ${parameters.instrument.AssetType} (UIC ${parameters.instrument.Uic})`,
          )
        }

        return await app.trading.orders.post({
          AssetType: 'FxForwards',
          ForwardDate: forwardDate.Date,
          Amount: amount,
          BuySell: 'Buy',
          ManualOrder: false,
          OrderType: 'Market', // todo parameter
          OrderDuration: { DurationType: 'ImmediateOrCancel' },
          ExternalReference: crypto.randomUUID(),
          Uic: parameters.instrument.Uic,
        })
      }

      case 'Bond':
      case 'CfdOnIndex':
      case 'CompanyWarrant':
      case 'CfdOnCompanyWarrant':
      case 'Stock':
      case 'CfdOnStock':
      case 'ContractFutures':
      case 'CfdOnFutures':
      case 'Etc':
      case 'CfdOnEtc':
      case 'Etf':
      case 'CfdOnEtf':
      case 'Etn':
      case 'CfdOnEtn':
      case 'Fund':
      case 'CfdOnFund':
      case 'FxNoTouchOption':
      case 'FxOneTouchOption':
      case 'FxSpot':
      case 'FxSwap':
      case 'FxVanillaOption':
      case 'Rights':
      case 'CfdOnRights': {
        return await app.trading.orders.post({
          AssetType: parameters.instrument.AssetType,
          Amount: amount,
          BuySell: 'Buy',
          ManualOrder: false,
          OrderType: 'Market', // todo parameter
          OrderDuration: { DurationType: 'DayOrder' },
          ExternalReference: crypto.randomUUID(),
          Uic: parameters.instrument.Uic,
        })
      }

      default: {
        throw new Error(`Unknown asset type`)
      }
    }
  }
}
