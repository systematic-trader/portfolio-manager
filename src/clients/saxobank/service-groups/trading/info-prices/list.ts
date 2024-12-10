import {
  assertReturn,
  type ObjectGuard,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import type { InfoPriceGroupSpec } from '../../../types/derives/info-price-group-spec.ts'
import type { OrderAmountType } from '../../../types/derives/order-amount-type.ts'
import { InfoPriceListRequest } from '../../../types/records/info-price-list-request.ts'
import {
  type InfoPriceResponse,
  InfoPriceResponseBond,
  InfoPriceResponseCfdOnCompanyWarrant,
  InfoPriceResponseCfdOnEtc,
  InfoPriceResponseCfdOnEtf,
  InfoPriceResponseCfdOnEtn,
  InfoPriceResponseCfdOnFund,
  InfoPriceResponseCfdOnFutures,
  InfoPriceResponseCfdOnIndex,
  InfoPriceResponseCfdOnRights,
  InfoPriceResponseCfdOnStock,
  InfoPriceResponseCompanyWarrant,
  InfoPriceResponseContractFutures,
  InfoPriceResponseEtc,
  InfoPriceResponseEtf,
  InfoPriceResponseEtn,
  InfoPriceResponseFund,
  InfoPriceResponseFuturesOption,
  InfoPriceResponseFxForwards,
  InfoPriceResponseFxNoTouchOption,
  InfoPriceResponseFxOneTouchOption,
  InfoPriceResponseFxSpot,
  InfoPriceResponseFxSwap,
  InfoPriceResponseFxVanillaOption,
  InfoPriceResponseRights,
  InfoPriceResponseStock,
  InfoPriceResponseStockIndexOption,
  InfoPriceResponseStockOption,
} from '../../../types/records/info-price-response.ts'

export class List {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('list')
  }

  async *get<AssetType extends keyof InfoPriceResponse>(
    parameters:
      & ({
        /** The instrument's asset type */
        readonly AssetType: AssetType

        /** Unique instrument identifier */
        readonly Uics: InfoPriceListRequest[AssetType]['Uics']

        /**
         * Unique key identifying the account used in retrieving the infoprice.
         * Only required when calling context represents an authenticated user.
         * If not supplied a default account is assumed.
         */
        readonly AccountKey?: InfoPriceListRequest[AssetType]['AccountKey']

        /** Order size, defaults to minimal order size for given instrument. */
        readonly Amount?: InfoPriceListRequest[AssetType]['Amount']

        /** Specifies whether the order will be created to open/increase or close/decrease a position (only relevant for options). */
        readonly ToOpenClose?: InfoPriceListRequest[AssetType]['ToOpenClose']
      })
      & (AssetType extends 'FxForwards' ? {
          /**
           * Forward date.
           *
           * For an FxSpot, the value date is always today plus two bank days.
           * A forward date is the intended value date for the resulting spot position and must be
           *   a) more than two bank days in the future (or it would just be a spot) as well as
           *   b) within the FxForwardMinForwardDate and FxForwardMaxForwardDate range as specified on the instrument data.
           *
           * Note that if the forward date is a bank holiday, the provided will be for the following bank day.
           * The date of the corrected date can be found as the value date of the price response in the InstrumentPriceDetails field group.
           */
          readonly ForwardDate?: InfoPriceListRequest[AssetType]['ForwardDate']
        }
        : object)
      & (AssetType extends 'FxNoTouchOption' | 'FxOneTouchOption' | 'FxVanillaOption' ? {
          /**
           * Required for asset types: FxNoTouchOption, FxOneTouchOption and FxVanillaOption.
           *
           * This parameter for Fx options behaves like the ForwardDate for forwards.
           * If an expiry date is a bank holiday, the API will use the next following bank day as expiry date and return the corrected date in the InstrumentPriceDetails field group's ExpiryDate field.
           */
          readonly ExpiryDate: InfoPriceListRequest[AssetType]['ExpiryDate']
        }
        : object)
      & (AssetType extends 'FxNoTouchOption' | 'FxOneTouchOption' ? {
          /**
           * For FxOneTouch and FxNoTouch option, only one of these fields can be set.
           * If none is provided, the API automatically picks a LowerBarrier value.
           * The chosen LowerBarrier value is returned as LowerBarrier in the InstrumentPriceDetails field group.
           */
          readonly LowerBarrier?: InfoPriceListRequest[AssetType]['LowerBarrier']

          /**
           * For FxOneTouch and FxNoTouch option, only one of these fields can be set.
           * If none is provided, the API automatically picks a LowerBarrier value.
           * The chosen LowerBarrier value is returned as LowerBarrier in the InstrumentPriceDetails field group.
           */
          readonly UpperBarrier?: InfoPriceListRequest[AssetType]['UpperBarrier']
        }
        : object)
      & (AssetType extends 'FxVanillaOption' ? {
          /**
           * Required for asset types: FxVanillaOption
           */
          readonly PutCall: InfoPriceListRequest[AssetType]['PutCall']
        }
        : object)
      & (AssetType extends 'FxSwap' ? {
          /**
           * Required for asset types: FxSwap.
           *
           * Forward date for near leg.
           */
          readonly ForwardDateNearLeg: InfoPriceListRequest['FxSwap']['ForwardDateNearLeg']

          /**
           * Required for asset types: FxSwap.
           *
           * Forward date for far leg.
           */
          readonly ForwardDateFarLeg: InfoPriceListRequest['FxSwap']['ForwardDateFarLeg']
        }
        : object),
    options: { readonly timeout?: undefined | number } = {},
  ): AsyncGenerator<InfoPriceResponse[keyof InfoPriceResponse], void, undefined> {
    const AmountType: OrderAmountType = 'Quantity'
    const FieldGroups: readonly InfoPriceGroupSpec[] = [
      'Commissions',
      'DisplayAndFormat',
      'Greeks',
      'HistoricalChanges',
      'InstrumentPriceDetails',
      'MarketDepth',
      'PriceInfo',
      'PriceInfoDetails',
      'Quote',
    ]

    const assertedParameters = assertReturn(InfoPriceListRequest[parameters.AssetType] as ObjectGuard, parameters)

    const searchParams = {
      AmountType,
      FieldGroups,
      ...assertedParameters,
    }

    const infoPrices = this.#client.getPaginated<object>({
      searchParams,
      timeout: options.timeout,
    }).execute()

    for await (const infoPrice of infoPrices) {
      switch (parameters.AssetType) {
        case 'Bond': {
          yield assertReturn(InfoPriceResponseBond, infoPrice)
          break
        }

        case 'CfdOnIndex': {
          yield assertReturn(InfoPriceResponseCfdOnIndex, infoPrice)
          break
        }

        case 'CompanyWarrant': {
          yield assertReturn(InfoPriceResponseCompanyWarrant, infoPrice)
          break
        }

        case 'CfdOnCompanyWarrant': {
          yield assertReturn(InfoPriceResponseCfdOnCompanyWarrant, infoPrice)
          break
        }

        case 'Stock': {
          yield assertReturn(InfoPriceResponseStock, infoPrice)
          break
        }

        case 'CfdOnStock': {
          yield assertReturn(InfoPriceResponseCfdOnStock, infoPrice)
          break
        }

        case 'StockIndexOption': {
          yield assertReturn(InfoPriceResponseStockIndexOption, infoPrice)
          break
        }

        case 'StockOption': {
          yield assertReturn(InfoPriceResponseStockOption, infoPrice)
          break
        }

        case 'ContractFutures': {
          yield assertReturn(InfoPriceResponseContractFutures, infoPrice)
          break
        }

        case 'CfdOnFutures': {
          yield assertReturn(InfoPriceResponseCfdOnFutures, infoPrice)
          break
        }

        case 'Etc': {
          yield assertReturn(InfoPriceResponseEtc, infoPrice)
          break
        }

        case 'CfdOnEtc': {
          yield assertReturn(InfoPriceResponseCfdOnEtc, infoPrice)
          break
        }

        case 'Etf': {
          yield assertReturn(InfoPriceResponseEtf, infoPrice)
          break
        }

        case 'CfdOnEtf': {
          yield assertReturn(InfoPriceResponseCfdOnEtf, infoPrice)
          break
        }

        case 'Etn': {
          yield assertReturn(InfoPriceResponseEtn, infoPrice)
          break
        }

        case 'CfdOnEtn': {
          yield assertReturn(InfoPriceResponseCfdOnEtn, infoPrice)
          break
        }

        case 'Fund': {
          yield assertReturn(InfoPriceResponseFund, infoPrice)
          break
        }

        case 'CfdOnFund': {
          yield assertReturn(InfoPriceResponseCfdOnFund, infoPrice)
          break
        }

        case 'FuturesOption': {
          yield assertReturn(InfoPriceResponseFuturesOption, infoPrice)
          break
        }

        case 'FxForwards': {
          yield assertReturn(InfoPriceResponseFxForwards, infoPrice)
          break
        }

        case 'FxNoTouchOption': {
          yield assertReturn(InfoPriceResponseFxNoTouchOption, infoPrice)
          break
        }

        case 'FxOneTouchOption': {
          yield assertReturn(InfoPriceResponseFxOneTouchOption, infoPrice)
          break
        }

        case 'FxSpot': {
          yield assertReturn(InfoPriceResponseFxSpot, infoPrice)
          break
        }

        case 'FxSwap': {
          yield assertReturn(InfoPriceResponseFxSwap, infoPrice)
          break
        }

        case 'FxVanillaOption': {
          yield assertReturn(InfoPriceResponseFxVanillaOption, infoPrice)
          break
        }

        case 'Rights': {
          yield assertReturn(InfoPriceResponseRights, infoPrice)
          break
        }

        case 'CfdOnRights': {
          yield assertReturn(InfoPriceResponseCfdOnRights, infoPrice)
          break
        }

        default: {
          throw new Error('Unsupported asset type')
        }
      }
    }
  }
}
