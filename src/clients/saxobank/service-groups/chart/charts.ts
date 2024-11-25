import {
  assertReturn,
  enums,
  type GuardType,
  integer,
  never,
  optional,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { extractKeys } from '../../../../utils/object.ts'
import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import type { ChartFieldGroupSpec } from '../../types/derives/chart-field-group-spec.ts'
import { ChartRequestMode } from '../../types/derives/chart-request-mode.ts'
import { Horizon } from '../../types/derives/horizon.ts'
import { ChartResponse } from '../../types/records/chart-response.ts'

const ChartsParametersModeAndTimeGuard = union([
  props({
    Mode: optional(never()),
    Time: optional(never()),
  }),

  props({
    Mode: ChartRequestMode,
    Time: string({ format: 'date-iso8601' }),
  }),
])

const ChartsParametersGuard = props({
  AssetType: enums(extractKeys(ChartResponse)),
  Horizon: Horizon,
  Uic: integer(),
  AccountKey: optional(string()),
  Count: optional(integer({ minimum: 1, maximum: 1200 })),
})

export type ChartsParameters =
  & GuardType<typeof ChartsParametersGuard>
  & GuardType<typeof ChartsParametersModeAndTimeGuard>

export class Charts {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v3/charts')
  }

  async get<AssetType extends keyof ChartResponse>(
    parameters:
      & {
        /** Asset type of the instrument. */
        readonly AssetType: AssetType

        /** The time period that each sample covers, in minutes. */
        readonly Horizon: ChartsParameters['Horizon']

        /** UIC (Universal Instrument Code) of the instrument. */
        readonly Uic: ChartsParameters['Uic']

        /** Optional */
        readonly AccountKey?: ChartsParameters['AccountKey']

        /** Specifies maximum number of samples to return, max 1200, default 1200. */
        readonly Count?: ChartsParameters['Count']
      }
      & (
        | ({
          /**
           * Mode specifies if the endpoint should returns samples "UpTo" or "From" the specified time.
           * The results will include the sample at the specified time.
           *
           * Please note that when Mode=UpTo and count=1, sometimes the returned data will be empty.
           */
          readonly Mode: NonNullable<ChartsParameters['Mode']>

          /**
           * Specifies the time of a sample, which must either be the first (If Mode="From") or the last (if Mode="UpTo") in the returned data.
           * The time must be in ISO8601 format.
           * Minutes and seconds are ignored.
           */
          readonly Time: NonNullable<ChartsParameters['Time']>
        })
        | ({
          readonly Mode?: undefined
          readonly Time?: undefined
        })
      ),
    options?: { readonly timeout?: undefined | number },
  ): Promise<ChartResponse[AssetType]>

  async get(
    parameters: ChartsParameters,
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<ChartResponse[keyof ChartResponse]> {
    const { AssetType, AccountKey, Count, Horizon, Uic } = assertReturn(ChartsParametersGuard, {
      AssetType: parameters.AssetType,
      AccountKey: parameters.AccountKey,
      Count: parameters.Count,
      Horizon: parameters.Horizon,
      Uic: parameters.Uic,
    })

    const { Mode, Time } = assertReturn(ChartsParametersModeAndTimeGuard, {
      Mode: parameters.Mode,
      Time: parameters.Time,
    })

    const FieldGroups: readonly ChartFieldGroupSpec[] = ['ChartInfo', 'Data', 'DisplayAndFormat']

    const searchParams = {
      AccountKey,
      AssetType,
      Count,
      Horizon,
      Uic,
      Mode,
      Time,
      FieldGroups,
    }

    switch (parameters.AssetType) {
      case 'Bond':
      case 'CfdOnCompanyWarrant':
      case 'CfdOnEtc':
      case 'CfdOnEtf':
      case 'CfdOnEtn':
      case 'CfdOnFund':
      case 'CfdOnRights':
      case 'CfdOnStock':
      case 'CompanyWarrant':
      case 'ContractFutures':
      case 'Etc':
      case 'Etf':
      case 'Etn':
      case 'Fund':
      case 'Rights':
      case 'Stock':
      case 'StockIndex': {
        return await this.#client.get({
          searchParams,
          guard: ChartResponse[parameters.AssetType],
          timeout: options.timeout,
        }).execute()
      }

      case 'CfdOnFutures':
      case 'CfdOnIndex':
      case 'FxSpot': {
        return await this.#client.get({
          searchParams,
          guard: ChartResponse[parameters.AssetType],
          timeout: options.timeout,
        }).execute()
      }

      default: {
        throw new Error('Unsupported asset type')
      }
    }
  }
}
