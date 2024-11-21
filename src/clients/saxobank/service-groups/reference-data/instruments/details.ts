import { assertReturn } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { AssetType } from '../../../types/derives/asset-type.ts'

import { HTTPClientError } from '../../../../http-client.ts'
import type { ServiceGroupClient } from '../../../service-group-client.ts'
import {
  InstrumentDetailsBond,
  InstrumentDetailsCfdOnCompanyWarrant,
  InstrumentDetailsCfdOnEtc,
  InstrumentDetailsCfdOnEtf,
  InstrumentDetailsCfdOnEtn,
  InstrumentDetailsCfdOnFund,
  InstrumentDetailsCfdOnFutures,
  InstrumentDetailsCfdOnIndex,
  InstrumentDetailsCfdOnRights,
  InstrumentDetailsCfdOnStock,
  InstrumentDetailsCompanyWarrant,
  InstrumentDetailsContractFutures,
  InstrumentDetailsEtc,
  InstrumentDetailsEtf,
  InstrumentDetailsEtn,
  InstrumentDetailsFund,
  InstrumentDetailsFuturesStrategy,
  InstrumentDetailsFxForwards,
  InstrumentDetailsFxNoTouchOption,
  InstrumentDetailsFxOneTouchOption,
  InstrumentDetailsFxSpot,
  InstrumentDetailsFxSwap,
  InstrumentDetailsFxVanillaOption,
  InstrumentDetailsMutualFund,
  InstrumentDetailsRights,
  InstrumentDetailsStock,
  InstrumentDetailsStockIndex,
  type InstrumentDetailsType,
} from '../../../types/records/instrument-details.ts'

export class InstrumentsDetails {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('details')
  }

  get<T extends AssetType>(
    parameters: {
      readonly AssetTypes: readonly [T, ...ReadonlyArray<T>]
      readonly Uics?: undefined | ReadonlyArray<number | string>
      readonly AccountKey?: undefined | string
      readonly Tags?: undefined | ReadonlyArray<string>
      readonly limit?: undefined | number
    },
    options?: {
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
    },
  ): AsyncIterable<
    Extract<
      InstrumentDetailsType,
      { readonly AssetType: T }
    >,
    void,
    undefined
  >

  get(
    parameters?: undefined | {
      readonly AssetTypes?: undefined | readonly []
      readonly AccountKey?: undefined | string
      readonly Tags?: undefined | ReadonlyArray<string>
      readonly limit?: undefined | number
    },
    options?: {
      readonly signal?: undefined | AbortSignal
      readonly timeout?: undefined | number
    },
  ): AsyncIterable<InstrumentDetailsType, void, undefined>

  async *get(
    parameters?: undefined | {
      readonly AssetTypes?: undefined | ReadonlyArray<AssetType>
      readonly Uics?: undefined | ReadonlyArray<number | string>
      readonly AccountKey?: undefined | string
      readonly Tags?: undefined | ReadonlyArray<string>
      readonly limit?: undefined | number
    },
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<InstrumentDetailsType, void, undefined> {
    const { AssetTypes, Uics, AccountKey, Tags, limit } = parameters ?? {}

    if (Uics !== undefined && Uics.length > 0 && (AssetTypes === undefined || AssetTypes.length === 0)) {
      throw new Error('AssetTypes must be specified if Uics are specified')
    }

    const assetTypesSet = AssetTypes === undefined || AssetTypes.length === 0 ? undefined : new Set<string>(AssetTypes)

    try {
      for await (
        const instrument of this.#client.getPaginated<InstrumentDetailsType>({
          searchParams: {
            FieldGroups: 'OrderSetting,SupportedOrderTypeSettings,TradingSessions,MarketData',
            AssetTypes,
            Uics,
            AccountKey,
            Tags,
          },
          limit,
          timeout: options.timeout,
        }).execute()
      ) {
        if (assetTypesSet === undefined || assetTypesSet.has(instrument.AssetType)) {
          yield assertReturnInstrumentDetails(instrument)
        }
      }
    } catch (error) {
      // Saxobank API response with a 404 if an asset type has no instruments in their database
      if (error instanceof HTTPClientError && error.statusCode === 404) {
        return
      }

      throw error
    }
  }
}

function assertReturnInstrumentDetails(
  instrument: InstrumentDetailsType,
): InstrumentDetailsType {
  try {
    const { AssetType } = instrument

    switch (AssetType) {
      case 'Bond': {
        return assertReturn(InstrumentDetailsBond, instrument)
      }
      case 'CfdOnCompanyWarrant': {
        return assertReturn(InstrumentDetailsCfdOnCompanyWarrant, instrument)
      }

      case 'CfdOnEtc': {
        return assertReturn(InstrumentDetailsCfdOnEtc, instrument)
      }

      case 'CfdOnEtf': {
        return assertReturn(InstrumentDetailsCfdOnEtf, instrument)
      }

      case 'CfdOnEtn': {
        return assertReturn(InstrumentDetailsCfdOnEtn, instrument)
      }

      case 'CfdOnFund': {
        return assertReturn(InstrumentDetailsCfdOnFund, instrument)
      }

      case 'CfdOnFutures': {
        return assertReturn(InstrumentDetailsCfdOnFutures, instrument)
      }

      case 'CfdOnIndex': {
        return assertReturn(InstrumentDetailsCfdOnIndex, instrument)
      }

      case 'CfdOnRights': {
        return assertReturn(InstrumentDetailsCfdOnRights, instrument)
      }

      case 'CfdOnStock': {
        return assertReturn(InstrumentDetailsCfdOnStock, instrument)
      }

      case 'CompanyWarrant': {
        return assertReturn(InstrumentDetailsCompanyWarrant, instrument)
      }

      case 'ContractFutures': {
        return assertReturn(InstrumentDetailsContractFutures, instrument)
      }

      case 'Etc': {
        return assertReturn(InstrumentDetailsEtc, instrument)
      }

      case 'Etf': {
        return assertReturn(InstrumentDetailsEtf, instrument)
      }

      case 'Etn': {
        return assertReturn(InstrumentDetailsEtn, instrument)
      }

      case 'Fund': {
        return assertReturn(InstrumentDetailsFund, instrument)
      }

      case 'FuturesStrategy': {
        return assertReturn(InstrumentDetailsFuturesStrategy, instrument)
      }

      case 'FxForwards': {
        return assertReturn(InstrumentDetailsFxForwards, instrument)
      }

      case 'FxNoTouchOption': {
        return assertReturn(InstrumentDetailsFxNoTouchOption, instrument)
      }

      case 'FxOneTouchOption': {
        return assertReturn(InstrumentDetailsFxOneTouchOption, instrument)
      }

      case 'FxSpot': {
        return assertReturn(InstrumentDetailsFxSpot, instrument)
      }

      case 'FxSwap': {
        return assertReturn(InstrumentDetailsFxSwap, instrument)
      }

      case 'FxVanillaOption': {
        return assertReturn(InstrumentDetailsFxVanillaOption, instrument)
      }

      case 'MutualFund': {
        return assertReturn(InstrumentDetailsMutualFund, instrument)
      }

      case 'Rights': {
        return assertReturn(InstrumentDetailsRights, instrument)
      }

      case 'StockIndex': {
        return assertReturn(InstrumentDetailsStockIndex, instrument)
      }

      case 'Stock': {
        return assertReturn(InstrumentDetailsStock, instrument)
      }

      default: {
        throw new Error(`Unknown asset type: ${AssetType as string}`)
      }
    }
  } catch (error) {
    // console.error(instrument)
    throw error
  }
}
