import { type AssetType, AssetTypeValues } from '../../types/derives/asset-type.ts'
import type { ClassType } from '../../types/derives/class.ts'

import { assertReturn } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

import type { ServiceGroupClient } from '../../service-group-client.ts'
import {
  InstrumentSummaryInfoBond,
  InstrumentSummaryInfoCfdIndexOption,
  InstrumentSummaryInfoCfdOnCompanyWarrant,
  InstrumentSummaryInfoCfdOnEtc,
  InstrumentSummaryInfoCfdOnEtf,
  InstrumentSummaryInfoCfdOnEtn,
  InstrumentSummaryInfoCfdOnFund,
  InstrumentSummaryInfoCfdOnFutures,
  InstrumentSummaryInfoCfdOnIndex,
  InstrumentSummaryInfoCfdOnRights,
  InstrumentSummaryInfoCfdOnStock,
  InstrumentSummaryInfoCompanyWarrant,
  InstrumentSummaryInfoContractFutures,
  InstrumentSummaryInfoEtc,
  InstrumentSummaryInfoEtf,
  InstrumentSummaryInfoEtn,
  InstrumentSummaryInfoFund,
  InstrumentSummaryInfoFuturesOption,
  InstrumentSummaryInfoFuturesStrategy,
  InstrumentSummaryInfoFxForwards,
  InstrumentSummaryInfoFxNoTouchOption,
  InstrumentSummaryInfoFxOneTouchOption,
  InstrumentSummaryInfoFxSpot,
  InstrumentSummaryInfoFxSwap,
  InstrumentSummaryInfoFxVanillaOption,
  InstrumentSummaryInfoMutualFund,
  InstrumentSummaryInfoRights,
  InstrumentSummaryInfoStock,
  InstrumentSummaryInfoStockIndex,
  InstrumentSummaryInfoStockIndexOption,
  InstrumentSummaryInfoStockOption,
  type InstrumentSummaryInfoType,
} from '../../types/records/instrument-summary-info.ts'
import { ContractFuturesSpaces } from './instruments/contract-futures-spaces.ts'
import { ContractOptionSpaces } from './instruments/contract-option-spaces.ts'
import { InstrumentsDetails } from './instruments/details.ts'
import { TradingSchedule } from './instruments/trading-schedule.ts'

export class Instruments {
  readonly #client: ServiceGroupClient

  readonly contractoptionspaces: ContractOptionSpaces
  readonly details: InstrumentsDetails
  readonly futuresspaces: ContractFuturesSpaces
  readonly tradingschedule: TradingSchedule

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/instruments')

    this.contractoptionspaces = new ContractOptionSpaces({ client: this.#client })
    this.details = new InstrumentsDetails({ client: this.#client })
    this.futuresspaces = new ContractFuturesSpaces({ client: this.#client })
    this.tradingschedule = new TradingSchedule({ client: this.#client })
  }

  get<T extends AssetType>(
    parameters: {
      readonly limit?: undefined | number
      readonly AccountKey?: undefined | string
      readonly AssetTypes: readonly [T, ...ReadonlyArray<T>]
      readonly CanParticipateInMultiLegOrder?: undefined | boolean
      readonly Class?: undefined | ReadonlyArray<ClassType>
      readonly ExchangeId?: undefined | string
      readonly IncludeNonTradable?: undefined | boolean
      readonly Keywords?: undefined | ReadonlyArray<string>
      readonly Tags?: undefined | ReadonlyArray<string>
      readonly Uics?: undefined | ReadonlyArray<number>
    },
    options?: { readonly timeout?: undefined | number },
  ): AsyncIterable<
    Extract<
      InstrumentSummaryInfoType,
      { readonly AssetType: T }
    >,
    void,
    undefined
  >

  get(
    parameters?: undefined | {
      readonly limit?: undefined | number
      readonly AccountKey?: undefined | string
      readonly AssetTypes?: undefined | readonly []
      readonly CanParticipateInMultiLegOrder?: undefined | boolean
      readonly Class?: undefined | ReadonlyArray<ClassType>
      readonly ExchangeId?: undefined | string
      readonly IncludeNonTradable?: undefined | boolean
      readonly Keywords?: undefined | ReadonlyArray<string>
      readonly Tags?: undefined | ReadonlyArray<string>
      readonly Uics?: undefined | ReadonlyArray<number>
    },
    options?: { readonly timeout?: undefined | number },
  ): AsyncIterable<InstrumentSummaryInfoType, void, undefined>

  get(
    parameters?: undefined | {
      readonly limit?: undefined | number
      readonly AccountKey?: undefined | string
      readonly AssetTypes?: undefined | ReadonlyArray<AssetType>
      readonly CanParticipateInMultiLegOrder?: undefined | boolean
      readonly Class?: undefined | ReadonlyArray<ClassType>
      readonly ExchangeId?: undefined | string
      readonly IncludeNonTradable?: undefined | boolean
      readonly Keywords?: undefined | ReadonlyArray<string>
      readonly Tags?: undefined | ReadonlyArray<string>
      readonly Uics?: undefined | ReadonlyArray<number>
    },
    options?: { readonly timeout?: undefined | number },
  ): AsyncIterable<InstrumentSummaryInfoType, void, undefined>

  async *get(
    parameters: undefined | {
      readonly limit?: undefined | number
      readonly AccountKey?: undefined | string
      readonly AssetTypes?: undefined | ReadonlyArray<AssetType>
      readonly CanParticipateInMultiLegOrder?: undefined | boolean
      readonly Class?: undefined | ReadonlyArray<ClassType>
      readonly ExchangeId?: undefined | string
      readonly IncludeNonTradable?: undefined | boolean
      readonly Keywords?: undefined | ReadonlyArray<string>
      readonly Tags?: undefined | ReadonlyArray<string>
      readonly Uics?: undefined | ReadonlyArray<number>
    } = {},
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncIterable<InstrumentSummaryInfoType, void, undefined> {
    const { limit, Keywords, AssetTypes, IncludeNonTradable, ...rest } = { IncludeNonTradable: false, ...parameters }

    const searchParams = {
      ...rest,
      ...(AssetTypes === undefined || AssetTypes.length === 0 ? { AssetTypes: AssetTypeValues } : { AssetTypes }),
      ...(Keywords === undefined || Keywords.length === 0 ? {} : { Keywords: Keywords.join(' ') }),
      IncludeNonTradable,
      isTradableOrDefaultNonTradable: IncludeNonTradable === false,
    }

    for await (
      const instrument of this.#client.getPaginated<InstrumentSummaryInfoType>({
        searchParams,
        limit,
        timeout: options.timeout,
      }).execute()
    ) {
      try {
        const { AssetType } = instrument

        if (
          parameters.AssetTypes !== undefined && parameters.AssetTypes.length > 0 &&
          parameters.AssetTypes.includes(AssetType) === false
        ) {
          continue
        }

        switch (AssetType) {
          case 'Bond': {
            yield assertReturn(InstrumentSummaryInfoBond, instrument)
            break
          }

          case 'CfdIndexOption': {
            yield assertReturn(InstrumentSummaryInfoCfdIndexOption, instrument)
            break
          }

          case 'CfdOnCompanyWarrant': {
            yield assertReturn(
              InstrumentSummaryInfoCfdOnCompanyWarrant,
              instrument,
            )
            break
          }

          case 'CfdOnEtc': {
            yield assertReturn(InstrumentSummaryInfoCfdOnEtc, instrument)
            break
          }

          case 'CfdOnEtf': {
            yield assertReturn(InstrumentSummaryInfoCfdOnEtf, instrument)
            break
          }

          case 'CfdOnEtn': {
            yield assertReturn(InstrumentSummaryInfoCfdOnEtn, instrument)
            break
          }

          case 'CfdOnFund': {
            yield assertReturn(InstrumentSummaryInfoCfdOnFund, instrument)
            break
          }

          case 'CfdOnFutures': {
            yield assertReturn(InstrumentSummaryInfoCfdOnFutures, instrument)
            break
          }

          case 'CfdOnIndex': {
            yield assertReturn(InstrumentSummaryInfoCfdOnIndex, instrument)
            break
          }

          case 'CfdOnRights': {
            yield assertReturn(InstrumentSummaryInfoCfdOnRights, instrument)
            break
          }

          case 'CfdOnStock': {
            yield assertReturn(InstrumentSummaryInfoCfdOnStock, instrument)
            break
          }

          case 'CompanyWarrant': {
            yield assertReturn(
              InstrumentSummaryInfoCompanyWarrant,
              instrument,
            )
            break
          }

          case 'ContractFutures': {
            yield assertReturn(
              InstrumentSummaryInfoContractFutures,
              instrument,
            )
            break
          }

          case 'Etc': {
            yield assertReturn(InstrumentSummaryInfoEtc, instrument)
            break
          }

          case 'Etf': {
            yield assertReturn(InstrumentSummaryInfoEtf, instrument)
            break
          }

          case 'Etn': {
            yield assertReturn(InstrumentSummaryInfoEtn, instrument)
            break
          }

          case 'Fund': {
            yield assertReturn(InstrumentSummaryInfoFund, instrument)
            break
          }

          case 'FuturesOption': {
            yield assertReturn(
              InstrumentSummaryInfoFuturesOption,
              instrument,
            )
            break
          }

          case 'FuturesStrategy': {
            yield assertReturn(
              InstrumentSummaryInfoFuturesStrategy,
              instrument,
            )
            break
          }

          case 'FxSpot': {
            yield assertReturn(InstrumentSummaryInfoFxSpot, instrument)
            break
          }

          case 'FxSwap': {
            yield assertReturn(InstrumentSummaryInfoFxSwap, instrument)
            break
          }

          case 'FxForwards': {
            yield assertReturn(InstrumentSummaryInfoFxForwards, instrument)
            break
          }

          case 'FxNoTouchOption': {
            yield assertReturn(InstrumentSummaryInfoFxNoTouchOption, instrument)
            break
          }

          case 'FxOneTouchOption': {
            yield assertReturn(InstrumentSummaryInfoFxOneTouchOption, instrument)
            break
          }

          case 'FxVanillaOption': {
            yield assertReturn(
              InstrumentSummaryInfoFxVanillaOption,
              instrument,
            )
            break
          }

          case 'MutualFund': {
            yield assertReturn(InstrumentSummaryInfoMutualFund, instrument)
            break
          }

          case 'Rights': {
            yield assertReturn(InstrumentSummaryInfoRights, instrument)
            break
          }

          case 'StockIndexOption': {
            yield assertReturn(
              InstrumentSummaryInfoStockIndexOption,
              instrument,
            )
            break
          }

          case 'StockIndex': {
            yield assertReturn(InstrumentSummaryInfoStockIndex, instrument)
            break
          }

          case 'StockOption': {
            yield assertReturn(InstrumentSummaryInfoStockOption, instrument)
            break
          }

          case 'Stock': {
            yield assertReturn(InstrumentSummaryInfoStock, instrument)
            break
          }

          default: {
            throw new Error(`Unknown asset type: ${AssetType as string}`)
          }
        }
      } catch (error) {
        // deno-lint-ignore no-console
        console.error(instrument)
        throw error
      }
    }
  }
}
