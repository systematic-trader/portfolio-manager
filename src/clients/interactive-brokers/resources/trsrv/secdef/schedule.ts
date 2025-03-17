import { array, enums, type GuardType, literal, optional, props, string } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import type { AssetClass } from '../../../types/derived/asset-class.ts'
import { ExchangeCode } from '../../../types/derived/exchange-code.ts'

const TradingTime = props({
  cancelDayOrders: enums(['Y', 'N']),
  closingTime: string({ format: 'number', length: 4 }),
  openingTime: string({ format: 'number', length: 4 }),
  prop: optional(literal('LIQUID')),
})

const Session = props({
  closingTime: string({ format: 'number', length: 4 }),
  openingTime: string({ format: 'number', length: 4 }),
  prop: literal('LIQUID'),
})

const ScheduleEntry = props({
  clearingCycleEndTime: string({ format: 'number' }),
  sessions: optional(array(Session)),
  tradingScheduleDate: string({ format: 'number' }),
  tradingtimes: optional(array(TradingTime)),
})

const ExchangeSchedule = props({
  description: string(),
  exchange: ExchangeCode,
  id: string(),
  timezone: string(), // todo do we have a better guard for this?
  tradeVenueId: string(),
  schedules: array(ScheduleEntry),
})

interface ExchangeSchedule extends GuardType<typeof ExchangeSchedule> {}

export class Schedule {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client.appendPath('schedule')
  }

  /**
   * Returns the trading schedule up to a month for the requested contract.
   */
  async get(parameters: {
    /** Specify the security type of the given contract */
    readonly assetClass: Extract<AssetClass, 'STK' | 'OPT' | 'FUT' | 'CFD' | 'WAR' | 'SWP' | 'FND' | 'BND' | 'ICS'>

    /** Specify the symbol for your contract */
    readonly symbol: string

    /** Specify the primary exchange of your contract */
    readonly exchange?: undefined | ExchangeCode

    /** Specify all exchanges you want to retrieve data from */
    readonly exchangeFilter?: undefined | readonly ExchangeCode[]
  }, { signal, timeout }: {
    readonly signal?: undefined | AbortSignal
    readonly timeout?: undefined | number
  } = {}): Promise<readonly ExchangeSchedule[]> {
    const results = await this.#client.get({
      searchParams: {
        ...parameters,
        exchangeFilter: parameters.exchangeFilter?.join(','),
      },
      guard: optional(array(ExchangeSchedule)),
      signal,
      timeout,
    })

    return results ?? []
  }
}
