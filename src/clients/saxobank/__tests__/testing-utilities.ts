import { toArray } from '../../../utils/async-iterable.ts'
import { Timeout } from '../../../utils/timeout.ts'
import type { SaxoBankApplication } from '../../saxobank-application.ts'
import type { AssetType } from '../types/derives/asset-type.ts'
import type { InstrumentSessionState } from '../types/derives/instrument-session-state.ts'
import type { InstrumentDetailsType } from '../types/records/instrument-details.ts'

const PORTFOLIO_RATE_LIMIT_ESTIMATES = {
  // this is a bit more than the rate limit of 240 requests per minute
  delay: 300,
  timeout: 80_000,
}

export class TestingUtilities {
  #app: SaxoBankApplication

  constructor({ app }: {
    readonly app: SaxoBankApplication
  }) {
    this.#app = app
    this.resetSimulationAccount = this.resetSimulationAccount.bind(this)
    this.waitForOrderCount = this.waitForOrderCount.bind(this)
    this.waitForPositionCount = this.waitForPositionCount.bind(this)
    this.findTradableInstruments = this.findTradableInstruments.bind(this)
  }

  /**
   * Resets a simulation account.
   * This will delete any positions and orders and set the account balance to the specified value.
   */
  async resetSimulationAccount({
    balance = 50_000,
  }: {
    /**
     * The balance to reset the account to.
     * Must be within the range of 0 to 10,000,000.
     * The default is 50,000.
     */
    readonly balance?: undefined | number
  } = {}): Promise<void> {
    const [account] = await toArray(this.#app.portfolio.accounts.me.get())
    if (account === undefined) {
      throw new Error(`Could not determine client for simulation user`)
    }

    await this.#app.portfolio.accounts.account.reset.put({
      AccountKey: account.AccountKey,
      NewBalance: balance,
    })
  }

  /**
   * Wait for the number of orders to reach the specified count.
   * This will poll the orders endpoint until the count matches the specified value.
   * This is useful when you need to wait for orders to be processed before continuing.
   */
  async waitForOrderCount(
    {
      count,
      delay = PORTFOLIO_RATE_LIMIT_ESTIMATES.delay,
      timeout = PORTFOLIO_RATE_LIMIT_ESTIMATES.timeout,
    }: {
      readonly count?: undefined | number
      readonly delay?: undefined | number
      readonly timeout?: undefined | number
    },
  ): Promise<void> {
    const startTime = Date.now()
    while (true) {
      const elapsed = Date.now() - startTime
      const remaining = timeout - elapsed

      if (remaining <= 0) {
        throw new Error(`Timeout waiting for order count to be ${count}`)
      }

      const orders = await toArray(this.#app.portfolio.orders.me.get({}, {
        timeout: remaining,
      }))

      if (orders.length === count) {
        return
      }

      await Timeout.wait(delay)
    }
  }

  /**
   * Wait for the number of positions to reach the specified count.
   * This will poll the positions endpoint until the count matches the specified value.
   * This is useful when you need to wait for positions to be processed before continuing.
   */
  async waitForPositionCount(
    {
      count,
      delay = PORTFOLIO_RATE_LIMIT_ESTIMATES.delay,
      timeout = PORTFOLIO_RATE_LIMIT_ESTIMATES.timeout,
    }: {
      readonly count?: undefined | number
      readonly delay?: undefined | number
      readonly timeout?: undefined | number
    },
  ): Promise<void> {
    const startTime = Date.now()
    while (true) {
      const elapsed = Date.now() - startTime
      const remaining = timeout - elapsed

      if (remaining <= 0) {
        throw new Error(`Timeout waiting for position count to be ${count}`)
      }

      const positions = await toArray(this.#app.portfolio.positions.me.get({
        timeout: remaining,
      }))

      if (positions.length === count) {
        return
      }

      await Timeout.wait(delay)
    }
  }

  /**
   * Find tradable instruments for the given asset types, based on reference data.
   * Instruments that are explicitly marked as non-tradable will be excluded (either by `IsTradable` or `NonTradableReason`).
   */
  async *findTradableInstruments<T extends AssetType>({
    assetTypes,
    uics,
    sessions,
    limit,
  }: {
    readonly assetTypes: readonly [T, ...readonly T[]]
    readonly uics?: undefined | readonly number[]
    readonly sessions?: undefined | readonly InstrumentSessionState[]
    readonly limit?: undefined | number
  }): AsyncGenerator<
    Extract<InstrumentDetailsType, { readonly AssetType: T }>,
    void,
    undefined
  > {
    if (limit !== undefined && limit <= 0) {
      return
    }

    const now = new Date().toISOString()

    const instruments = this.#app.referenceData.instruments.details.get({
      AssetTypes: assetTypes,
      Uics: uics,
    })

    let count = 0
    for await (const instrument of instruments) {
      if ('IsTradable' in instrument && instrument.IsTradable === false) {
        continue
      }

      if ('NonTradableReason' in instrument && ['None'].includes(instrument.NonTradableReason) === false) {
        continue
      }

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

      yield instrument

      if (++count === limit) {
        break
      }
    }
  }
}
