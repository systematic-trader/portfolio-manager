import { toArray } from '../../../utils/async-iterable.ts'
import { Timeout } from '../../../utils/timeout.ts'
import type { SaxoBankApplication } from '../../saxobank-application.ts'
import { SaxoBankRandom } from '../saxobank-random.ts'
import type {
  PlaceOrderResponseEntryWithNoRelatedOrders,
  SupportedPlacableOrderTypes,
} from '../service-groups/trading/orders.ts'
import type { AssetType } from '../types/derives/asset-type.ts'
import type { BuySell } from '../types/derives/buy-sell.ts'
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
import { QuoteKnown } from '../types/records/quote.ts'
import type { TickSizeScheme } from '../types/records/tick-size-scheme.ts'

const PORTFOLIO_RATE_LIMIT_ESTIMATES = {
  delay: 60_000 / 240, // This matches the OpenAPI rate limit of 240 requests per minute.
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
    this.roundPriceToTickSize = this.roundPriceToTickSize.bind(this)
    this.roundPriceToTickScheme = this.roundPriceToTickScheme.bind(this)
    this.calculateMinimumTradeSize = this.calculateMinimumTradeSize.bind(this)
    this.calculateFavourableOrderPrice = this.calculateFavourableOrderPrice.bind(this)
    this.placeFavourableOrder = this.placeFavourableOrder.bind(this)
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
     * The default is 1,000,000.
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
        throw new Error('Timeout waiting for portfolio state')
      }

      if (orders) {
        await Timeout.wait(delay)

        const currentOrders = await toArray(app.portfolio.orders.get(
          { ClientKey: clientKey },
          { timeout: remaining },
        ))

        if (this.#valueMatchesCondition(currentOrders.length, orders)) {
          return
        }
      }

      if (positions) {
        await Timeout.wait(delay)

        const currentPositions = await toArray(app.portfolio.positions.get(
          { ClientKey: clientKey },
          { timeout: remaining },
        ))

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
  findTradableInstruments<
    AssetType extends
      | 'Etn'
      | 'Stock'
      | 'StockIndex'
      | 'Bond'
      | 'CfdOnCompanyWarrant'
      | 'CfdOnEtc'
      | 'CfdOnEtf'
      | 'CfdOnEtn'
      | 'CfdOnFund'
      | 'CfdOnFutures'
      | 'CfdOnIndex'
      | 'CfdOnRights'
      | 'CfdOnStock'
      | 'CompanyWarrant'
      | 'ContractFutures'
      | 'Etc'
      | 'Etf'
      | 'Fund'
      | 'FxForwards'
      | 'FxNoTouchOption'
      | 'FxOneTouchOption'
      | 'FxSpot'
      | 'FxSwap'
      | 'FxVanillaOption'
      | 'Rights',
  >(parameters: {
    readonly app?: undefined | SaxoBankApplication
    readonly assetType: AssetType
    readonly uics?: undefined | readonly number[]
    readonly sessions?: undefined | readonly InstrumentSessionState[]
    readonly limit?: undefined | number
    readonly supportedOrderTypes?: undefined | readonly PlaceableOrderType[]
    readonly supportedTradeDirections?: undefined | readonly ('Long' | 'Short')[]
  }): AsyncGenerator<
    {
      readonly instrument: Extract<InstrumentDetailsUnion, { readonly AssetType: AssetType }>
      readonly quote: QuoteKnown
      readonly tradeDirections: readonly ['Long'] | readonly ['Long', 'Short']
    },
    void,
    undefined
  >

  async *findTradableInstruments({
    app: appOverride,
    assetType,
    uics,
    sessions,
    limit,
    supportedOrderTypes,
    supportedTradeDirections,
  }: {
    readonly app?: undefined | SaxoBankApplication
    readonly assetType: AssetType & keyof InfoPriceResponse
    readonly uics?: undefined | readonly number[]
    readonly sessions?: undefined | readonly InstrumentSessionState[]
    readonly limit?: undefined | number
    readonly supportedOrderTypes?: undefined | readonly PlaceableOrderType[]
    readonly supportedTradeDirections?: undefined | readonly ('Long' | 'Short')[]
  }): AsyncGenerator<
    {
      readonly instrument: InstrumentDetailsUnion
      readonly quote: QuoteKnown
      readonly tradeDirections: readonly ['Long'] | readonly ['Long', 'Short']
    },
    void,
    undefined
  > {
    if (limit !== undefined && limit <= 0) {
      return
    }

    const app = appOverride ?? this.#app

    const instruments = app.referenceData.instruments.details.get({
      AssetTypes: [assetType],
      Uics: uics,
    })

    let count = 0
    for await (const instrument of instruments) {
      const now = new Date().toISOString()
      const supportedOrderTypesSet = new Set(supportedOrderTypes)
      const supportedTradeDirectionsSet = new Set(supportedTradeDirections)

      // Filter out any instruments that are not tradable
      // From talking to the Saxobank support, I've learned that "tradability" is twofold:
      // 1. The property "IsTradable" indicates whether the instrument is tradable for us specifically.
      // 2. The properties "TradingStatus" and "NonTradableReason" indicates wheather the instrument is tradable in general.
      if ('IsTradable' in instrument && instrument.IsTradable === false) {
        continue // We, specifically, are not allowed to trade this instrument
      }
      if (
        'TradingStatus' in instrument && ['Tradable'].includes(instrument.TradingStatus) === false ||
        'NonTradableReason' in instrument && ['None'].includes(instrument.NonTradableReason) === false
      ) {
        continue // The instrument is not tradable in general - please note that we also filter out any reduce-only positions, since it would be pretty hard to acquire them in a test
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

      // In order for us to know, if an instrument is tradeable, we need to know if there is a known quote. Otherwise we would be trading blind.
      // The quote is available through the info prices endpoint.
      // This implementation fetches info prices for each instrument, which is not optimal, but it's fine for testing purposes.
      // An alternative implementation would collect and group instruments by asset types, and call the list-endpoint when enough instruments have been accumulated for any given asset type.
      const infoPrice = await app.trading.infoPrices.get({
        AssetType: instrument.AssetType,
        Uic: instrument.Uic,
      })

      // We only considers known quotes to be tradable (otherwise, what would the price be?)
      if (QuoteKnown.accept(infoPrice.Quote) === false) {
        continue
      }

      // Some instruments have short selling disabled
      // This information is available through the prices or info prices endpoint. It does not seem to be available directly on the instrument details.
      // When placing a sell-order on an instrument that does not support short selling, the API will return an error.
      // It seems that going long is always enabled, if the instrument is tradable.
      const tradeDirections = (infoPrice.InstrumentPriceDetails?.ShortTradeDisabled === true)
        ? ['Long'] as const
        : ['Long', 'Short'] as const

      // Filter any instruments that do not support the specified trade directions
      if (supportedTradeDirectionsSet.size > 0) {
        if (tradeDirections.every((tradeDirection) => supportedTradeDirectionsSet.has(tradeDirection) === false)) {
          continue // instrument does not support any of the specified order types
        }
      }

      yield {
        instrument,
        quote: infoPrice.Quote,
        tradeDirections,
      }

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

  calculateFavourableOrderPrice(options: {
    readonly instrument: InstrumentDetailsUnion
    readonly quote: QuoteKnown
    readonly orderType: Extract<
      SupportedPlacableOrderTypes,
      | 'Limit'
      | 'Stop'
      | 'StopIfTraded'
      | 'TrailingStop'
      | 'TrailingStopIfTraded'
    >
    readonly buySell: BuySell
    readonly tolerance?: undefined | number
  }): {
    readonly orderPrice: number
    readonly stopLimitPrice?: never
    readonly tickSize?: undefined | number
  }

  calculateFavourableOrderPrice(options: {
    readonly instrument: InstrumentDetailsUnion
    readonly quote: QuoteKnown
    readonly orderType: Extract<SupportedPlacableOrderTypes, 'StopLimit'>
    readonly buySell: BuySell
    readonly tolerance?: undefined | number
  }): {
    readonly orderPrice: number
    readonly stopLimitPrice: number
    readonly tickSize?: undefined | number
  }

  calculateFavourableOrderPrice({
    instrument,
    quote,
    orderType,
    buySell,
    tolerance = 0.01, // todo can this be based on something from the instrument details?
  }: {
    readonly instrument: InstrumentDetailsUnion
    readonly quote: QuoteKnown
    readonly orderType: Extract<
      SupportedPlacableOrderTypes,
      | 'Limit'
      | 'Stop'
      | 'StopIfTraded'
      | 'TrailingStop'
      | 'TrailingStopIfTraded'
      | 'StopLimit'
    >
    readonly buySell: BuySell
    readonly tolerance?: undefined | number
  }): {
    readonly orderPrice: number
    readonly stopLimitPrice?: never
    readonly tickSize?: undefined | number
  } | {
    readonly orderPrice: number
    readonly stopLimitPrice: number
    readonly tickSize?: undefined | number
  } {
    switch (orderType) {
      case 'Limit': {
        const base = buySell === 'Buy' ? quote.Bid : quote.Ask
        const multiplier = buySell === 'Buy' ? (1 - tolerance) : (1 + tolerance)

        const { price: orderPrice, tickSize } = this.roundPriceToInstrumentSpecification({
          price: base * multiplier,
          instrument,
        })

        return { orderPrice, tickSize }
      }

      case 'Stop':
      case 'StopIfTraded':
      case 'TrailingStop':
      case 'TrailingStopIfTraded': {
        const base = buySell === 'Buy' ? quote.Ask : quote.Bid
        const multiplier = buySell === 'Buy' ? (1 + tolerance) : (1 - tolerance)

        const { price: orderPrice, tickSize } = this.roundPriceToInstrumentSpecification({
          price: base * multiplier,
          instrument,
        })

        return { orderPrice, tickSize }
      }

      case 'StopLimit': {
        const base = buySell === 'Buy' ? quote.Ask : quote.Bid
        const multiplier = buySell === 'Buy' ? (1 + tolerance) : (1 - tolerance)

        const { price: orderPrice, tickSize } = this.roundPriceToInstrumentSpecification({
          price: base * multiplier,
          instrument,
        })

        const { price: stopLimitPrice } = this.roundPriceToInstrumentSpecification({
          price: base * (multiplier ** 2),
          instrument,
        })

        return { orderPrice, stopLimitPrice, tickSize }
      }

      default: {
        throw new TypeError('Unknown order type')
      }
    }
  }

  roundPriceToDecimals({ price, decimals }: {
    readonly price: number
    readonly decimals: number
  }): number {
    const multiplier = 10 ** decimals
    return Math.round(price * multiplier) / multiplier
  }

  roundPriceToTickSize({
    price,
    tickSize,
  }: {
    readonly price: number
    readonly tickSize: number
  }): {
    readonly price: number
    readonly tickSize: number
  } {
    // Calculate the precision based on the tick size
    const precision = Math.ceil(-Math.log10(tickSize))
    const roundedPrice = Math.round((price + Number.EPSILON) / tickSize) * tickSize

    // Fix the precision to avoid floating-point artifacts
    return {
      price: parseFloat(roundedPrice.toFixed(precision)),
      tickSize,
    }
  }

  roundPriceToTickScheme({ price, tickSizeScheme }: {
    readonly price: number
    readonly tickSizeScheme: TickSizeScheme
  }): {
    readonly price: number
    readonly tickSize: number
  } {
    if (tickSizeScheme.Elements === undefined) {
      return this.roundPriceToTickSize({
        price,
        tickSize: tickSizeScheme.DefaultTickSize,
      })
    }

    const tickSizesSorted = [...tickSizeScheme.Elements].sort((left, right) => left.HighPrice - right.HighPrice)
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
    readonly instrument: InstrumentDetailsUnion
  }): {
    readonly price: number
    readonly tickSize?: undefined | number
  } {
    // Firstly, use the tick size scheme, if provided
    if ('TickSizeScheme' in instrument && instrument.TickSizeScheme !== undefined) {
      return this.roundPriceToTickScheme({
        price,
        tickSizeScheme: instrument.TickSizeScheme,
      })
    }

    // Otherwise use the fixed tick size
    if (instrument.TickSize !== undefined) {
      return this.roundPriceToTickSize({
        price,
        tickSize: instrument.TickSize,
      })
    }

    // If neither is provided, the price should be rounded to the instrument's number of decimals
    return {
      price: this.roundPriceToDecimals({
        price,

        // A price is always denoted in the the number of decimals supported by the instrument.
        // The number of decimals can be found on the instrument data looked up in the Reference Data.
        // However for certain Fx crosses the number is one higher if the format has the flag AllowDecimalPips.
        decimals: instrument.Format.Decimals + (instrument.Format.Format === 'AllowDecimalPips' ? 1 : 0),
      }),
    }
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

  #orderPlacementTimestamp = 0

  async placeFavourableOrder({
    app: appOverride,
    instrument,
    orderType,
    buySell,
    quote,
  }: {
    readonly app?: undefined | SaxoBankApplication
    readonly instrument: InstrumentDetailsUnion
    readonly orderType: SupportedPlacableOrderTypes
    readonly buySell: BuySell
    readonly quote: QuoteKnown
  }): Promise<PlaceOrderResponseEntryWithNoRelatedOrders> {
    const app = appOverride ?? this.#app

    const amount = this.calculateMinimumTradeSize(instrument)
    const referenceId = SaxoBankRandom.order.referenceId()
    const requestId = SaxoBankRandom.order.requestId()

    // Wait at least 1 second since the last order was placed.
    // Firstly, this is preventing rate limit errors (you can only place 1 order every second).
    // Secondly, when placing orders in quick succession, the OpenAPI will sometimes respond with a "RepeatTradeOnAutoQuote"-error.
    // This seems to happen when we re-try the order-placing request after receiving a rate-limit response, resulting in us retrying the request with the same request id and external reference.
    const now = Date.now()
    const deltaTime = now - this.#orderPlacementTimestamp
    if (deltaTime < 1000) {
      await Timeout.wait(1000 - deltaTime)
    }

    const { promise, reject, resolve } = Promise.withResolvers<PlaceOrderResponseEntryWithNoRelatedOrders>()

    switch (instrument.AssetType) {
      case 'Bond':
      case 'CfdOnEtc':
      case 'CfdOnEtf':
      case 'CfdOnEtn':
      case 'CfdOnFund':
      case 'CfdOnFutures':
      case 'CfdOnIndex':
      case 'CfdOnStock':
      case 'ContractFutures':
      case 'Etc':
      case 'Etf':
      case 'Etn':
      case 'Fund':
      case 'FxSpot':
      case 'Stock': {
        switch (orderType) {
          case 'Market': {
            resolve(
              await app.trading.orders.post({
                Amount: amount,
                AssetType: instrument.AssetType,
                BuySell: buySell,
                ExternalReference: referenceId,
                ManualOrder: false,
                OrderDuration: { DurationType: 'DayOrder' },
                OrderType: orderType,
                RequestId: requestId,
                Uic: instrument.Uic,
              }),
            )
            break
          }

          case 'Stop':
          case 'StopIfTraded':
          case 'Limit': {
            const { orderPrice } = this.calculateFavourableOrderPrice({
              buySell: buySell,
              instrument,
              orderType,
              quote,
            })

            resolve(
              await app.trading.orders.post({
                Amount: amount,
                AssetType: instrument.AssetType,
                BuySell: buySell,
                ExternalReference: referenceId,
                ManualOrder: false,
                OrderDuration: { DurationType: 'DayOrder' },
                OrderPrice: orderPrice,
                OrderType: orderType,
                RequestId: requestId,
                Uic: instrument.Uic,
              }),
            )
            break
          }

          case 'TrailingStop':
          case 'TrailingStopIfTraded': {
            const { orderPrice, tickSize } = this.calculateFavourableOrderPrice({
              buySell: buySell,
              instrument,
              orderType,
              quote,
            })

            resolve(
              await app.trading.orders.post({
                Amount: amount,
                AssetType: instrument.AssetType,
                BuySell: buySell,
                ExternalReference: referenceId,
                ManualOrder: false,
                OrderDuration: { DurationType: 'DayOrder' },
                OrderPrice: orderPrice,
                OrderType: orderType,
                RequestId: requestId,
                TrailingStopDistanceToMarket: tickSize ?? 1,
                TrailingStopStep: tickSize ?? 1,
                Uic: instrument.Uic,
              }),
            )
            break
          }

          case 'StopLimit': {
            const { orderPrice, stopLimitPrice } = this.calculateFavourableOrderPrice({
              buySell: buySell,
              instrument,
              orderType,
              quote,
            })

            resolve(
              await app.trading.orders.post({
                Amount: amount,
                AssetType: instrument.AssetType,
                BuySell: buySell,
                ExternalReference: referenceId,
                ManualOrder: false,
                OrderDuration: { DurationType: 'DayOrder' },
                OrderPrice: orderPrice,
                OrderType: orderType,
                RequestId: requestId,
                StopLimitPrice: stopLimitPrice,
                Uic: instrument.Uic,
              }),
            )
            break
          }

          default: {
            throw new Error(`Unsupported order type for asset type ${instrument.AssetType}`)
          }
        }

        break
      }

      case 'FxForwards': {
        const forwardDates = await toArray(app.referenceData.standarddates.forwardTenor.get({
          Uic: instrument.Uic,
        }))

        // It seems that the first date is not always valid
        // Forinstance on 2024-12-03, the first standard date is 2024-12-05, but when placing orders for the 5th, an error response is returned
        // I've contacted Saxo support regarding this - and until I get a response, we will just use the second earliest date
        const [_, earliestForwardStandardDate] = forwardDates.sort((left, right) => left.Date.localeCompare(right.Date))
        if (earliestForwardStandardDate === undefined) {
          throw new Error('Could not determine forward date')
        }

        const forwardDate = earliestForwardStandardDate.Date

        switch (orderType) {
          case 'Market': {
            resolve(
              await app.trading.orders.post({
                Amount: amount,
                AssetType: instrument.AssetType,
                BuySell: buySell,
                ExternalReference: referenceId,
                ForwardDate: forwardDate,
                ManualOrder: false,
                OrderDuration: { DurationType: 'ImmediateOrCancel' },
                OrderType: orderType,
                RequestId: requestId,
                Uic: instrument.Uic,
              }),
            )
            break
          }

          case 'Stop':
          case 'StopIfTraded':
          case 'Limit': {
            const { orderPrice } = this.calculateFavourableOrderPrice({
              buySell: buySell,
              instrument,
              orderType,
              quote,
            })

            resolve(
              await app.trading.orders.post({
                Amount: amount,
                AssetType: instrument.AssetType,
                BuySell: buySell,
                ExternalReference: referenceId,
                ForwardDate: forwardDate,
                ManualOrder: false,
                OrderDuration: { DurationType: 'ImmediateOrCancel' },
                OrderPrice: orderPrice,
                OrderType: orderType,
                RequestId: requestId,
                Uic: instrument.Uic,
              }),
            )
            break
          }

          case 'TrailingStop':
          case 'TrailingStopIfTraded': {
            const { orderPrice, tickSize } = this.calculateFavourableOrderPrice({
              buySell: buySell,
              instrument,
              orderType,
              quote,
            })

            resolve(
              await app.trading.orders.post({
                Amount: amount,
                AssetType: instrument.AssetType,
                BuySell: buySell,
                ExternalReference: referenceId,
                ForwardDate: forwardDate,
                ManualOrder: false,
                OrderDuration: { DurationType: 'ImmediateOrCancel' },
                OrderPrice: orderPrice,
                OrderType: orderType,
                RequestId: requestId,
                TrailingStopDistanceToMarket: tickSize ?? 1,
                TrailingStopStep: tickSize ?? 1,
                Uic: instrument.Uic,
              }),
            )
            break
          }

          case 'StopLimit': {
            const { orderPrice, stopLimitPrice } = this.calculateFavourableOrderPrice({
              buySell: buySell,
              instrument,
              orderType,
              quote,
            })

            resolve(
              await app.trading.orders.post({
                Amount: amount,
                AssetType: instrument.AssetType,
                BuySell: buySell,
                ExternalReference: referenceId,
                ForwardDate: forwardDate,
                ManualOrder: false,
                OrderDuration: { DurationType: 'ImmediateOrCancel' },
                OrderPrice: orderPrice,
                OrderType: orderType,
                StopLimitPrice: stopLimitPrice,
                Uic: instrument.Uic,
              }),
            )
            break
          }
        }

        break
      }

      default: {
        reject(`Unsupported asset type and order type: ${instrument.AssetType} / ${orderType.toString()}`)
        break
      }
    }

    const orderResponse = await promise

    this.#orderPlacementTimestamp = Date.now()

    return orderResponse
  }
}
