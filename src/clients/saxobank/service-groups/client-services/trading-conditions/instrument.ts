import { assertReturn } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import type { AssetType } from '../../../types/derives/asset-type.ts'
import {
  type ScheduledTradingConditionsFieldGroup,
  ScheduledTradingConditionsFieldGroupValues,
} from '../../../types/derives/scheduled-trading-conditions-field-group.ts'
import { InstrumentTradingConditions } from '../../../types/records/instrument-trading-conditions.ts'

export class Instrument {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('instrument')
  }

  async get<AssetType extends keyof InstrumentTradingConditions>(
    parameters: {
      readonly AccountKey: string
      readonly AssetType: AssetType
      readonly FieldGroups?: undefined | ScheduledTradingConditionsFieldGroup[]
      readonly Uic: number
    },
    options?: { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal },
  ): Promise<InstrumentTradingConditions[AssetType]>

  async get(
    { AccountKey, AssetType, FieldGroups, Uic }: {
      readonly AccountKey: string
      readonly AssetType: AssetType
      readonly FieldGroups?: undefined | ScheduledTradingConditionsFieldGroup[]
      readonly Uic: number
    },
    options: { readonly timeout?: undefined | number; readonly signal?: undefined | AbortSignal } = {},
  ): Promise<InstrumentTradingConditions[keyof InstrumentTradingConditions]> {
    const response = await this.#client.get({
      path: [AccountKey, Uic, AssetType].join('/'),
      searchParams: {
        FieldGroups: FieldGroups ?? ScheduledTradingConditionsFieldGroupValues,
      },
      timeout: options.timeout,
      signal: options.signal,
    }).execute()

    switch (AssetType) {
      case 'Etf': {
        return assertReturn(InstrumentTradingConditions[AssetType], response)
      }

      case 'FxSpot': {
        return assertReturn(InstrumentTradingConditions[AssetType], response)
      }

      case 'Stock': {
        return assertReturn(InstrumentTradingConditions[AssetType], response)
      }

      default: {
        throw new Error(`Unsupported asset type: ${AssetType}`)
      }
    }
  }
}
