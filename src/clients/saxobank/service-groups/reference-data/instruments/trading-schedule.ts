import { HTTPClientError } from '../../../../http-client.ts'
import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import type { AssetType } from '../../../types/derives/asset-type.ts'
import {
  TradingSchedule as TradingScheduleGuard,
  type TradingSchedule as TradingScheduleType,
} from '../../../types/records/trading-schedule.ts'

export class TradingSchedule {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('tradingschedule')
  }

  async get(
    { AssetType, Uic }: { readonly AssetType: AssetType; readonly Uic: number },
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<undefined | TradingScheduleType> {
    try {
      return await this.#client.get({
        path: `${Uic}/${AssetType}`,
        guard: TradingScheduleGuard,
        timeout: options.timeout,
      }).execute()
    } catch (error) {
      if (error instanceof HTTPClientError && error.statusCode === 404) {
        return undefined
      }

      throw error
    }
  }
}
