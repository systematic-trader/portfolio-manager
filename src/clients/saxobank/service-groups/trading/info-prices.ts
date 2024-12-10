import {
  assertReturn,
  type ObjectGuard,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InfoPriceGroupSpec } from '../../types/derives/info-price-group-spec.ts'
import type { OrderAmountType } from '../../types/derives/order-amount-type.ts'

import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { InfoPriceRequest } from '../../types/records/info-price-request.ts'
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
} from '../../types/records/info-price-response.ts'
import { List } from './info-prices/list.ts'
import { Subscriptions } from './info-prices/subscriptions.ts'

export class InfoPrices {
  readonly #client: ServiceGroupClient

  readonly subscriptions: Subscriptions
  readonly list: List

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/infoprices')

    this.subscriptions = new Subscriptions({ client: this.#client })
    this.list = new List({ client: this.#client })
  }

  async get<AssetType extends keyof InfoPriceRequest>(
    parameters:
      & ({
        /** The instrument's asset type */
        readonly AssetType: AssetType

        /** Unique instrument identifier */
        readonly Uic: InfoPriceRequest[AssetType]['Uic']

        /**
         * Unique key identifying the account used in retrieving the infoprice.
         * Only required when calling context represents an authenticated user.
         * If not supplied a default account is assumed.
         */
        readonly AccountKey?: InfoPriceRequest[AssetType]['AccountKey']

        /** Order size, defaults to minimal order size for given instrument. */
        readonly Amount?: InfoPriceRequest[AssetType]['Amount']

        /** Specifies whether the order will be created to open/increase or close/decrease a position (only relevant for options). */
        readonly ToOpenClose?: InfoPriceRequest[AssetType]['ToOpenClose']
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
          readonly ForwardDate?: InfoPriceRequest[AssetType]['ForwardDate']
        }
        : object)
      & (AssetType extends 'FxNoTouchOption' | 'FxOneTouchOption' | 'FxVanillaOption' ? {
          /**
           * Required for asset types: FxNoTouchOption, FxOneTouchOption and FxVanillaOption.
           *
           * This parameter for Fx options behaves like the ForwardDate for forwards.
           * If an expiry date is a bank holiday, the API will use the next following bank day as expiry date and return the corrected date in the InstrumentPriceDetails field group's ExpiryDate field.
           */
          readonly ExpiryDate: InfoPriceRequest[AssetType]['ExpiryDate']
        }
        : object)
      & (AssetType extends 'FxNoTouchOption' | 'FxOneTouchOption' ? {
          /**
           * For FxOneTouch and FxNoTouch option, only one of these fields can be set.
           * If none is provided, the API automatically picks a LowerBarrier value.
           * The chosen LowerBarrier value is returned as LowerBarrier in the InstrumentPriceDetails field group.
           */
          readonly LowerBarrier?: InfoPriceRequest[AssetType]['LowerBarrier']

          /**
           * For FxOneTouch and FxNoTouch option, only one of these fields can be set.
           * If none is provided, the API automatically picks a LowerBarrier value.
           * The chosen LowerBarrier value is returned as LowerBarrier in the InstrumentPriceDetails field group.
           */
          readonly UpperBarrier?: InfoPriceRequest[AssetType]['UpperBarrier']
        }
        : object)
      & (AssetType extends 'FxVanillaOption' ? {
          /**
           * Required for asset types: FxVanillaOption
           */
          readonly PutCall: InfoPriceRequest[AssetType]['PutCall']
        }
        : object)
      & (AssetType extends 'FxSwap' ? {
          /**
           * Required for asset types: FxSwap.
           *
           * Forward date for near leg.
           */
          readonly ForwardDateNearLeg: InfoPriceRequest['FxSwap']['ForwardDateNearLeg']

          /**
           * Required for asset types: FxSwap.
           *
           * Forward date for far leg.
           */
          readonly ForwardDateFarLeg: InfoPriceRequest['FxSwap']['ForwardDateFarLeg']
        }
        : object),
  ): Promise<
    InfoPriceResponse[AssetType]
  >

  async get(
    parameters: InfoPriceResponse[keyof InfoPriceResponse],
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<InfoPriceResponse[keyof InfoPriceResponse]> {
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

    const assertedParameters = assertReturn(InfoPriceRequest[parameters.AssetType] as ObjectGuard, parameters)

    const searchParams = {
      AmountType,
      FieldGroups,
      ...assertedParameters,
    }

    const response = await this.#client.get<object>({
      searchParams,
      timeout: options.timeout,
    }).execute()

    switch (parameters.AssetType) {
      case 'Bond': {
        return assertReturn(InfoPriceResponseBond, response)
      }

      case 'CfdOnIndex': {
        return assertReturn(InfoPriceResponseCfdOnIndex, response)
      }

      case 'CompanyWarrant': {
        return assertReturn(InfoPriceResponseCompanyWarrant, response)
      }

      case 'CfdOnCompanyWarrant': {
        return assertReturn(InfoPriceResponseCfdOnCompanyWarrant, response)
      }

      case 'Stock': {
        return assertReturn(InfoPriceResponseStock, response)
      }

      case 'CfdOnStock': {
        return assertReturn(InfoPriceResponseCfdOnStock, response)
      }

      case 'StockIndexOption': {
        return assertReturn(InfoPriceResponseStockIndexOption, response)
      }

      case 'StockOption': {
        return assertReturn(InfoPriceResponseStockOption, response)
      }

      case 'ContractFutures': {
        return assertReturn(InfoPriceResponseContractFutures, response)
      }

      case 'CfdOnFutures': {
        return assertReturn(InfoPriceResponseCfdOnFutures, response)
      }

      case 'Etc': {
        return assertReturn(InfoPriceResponseEtc, response)
      }

      case 'CfdOnEtc': {
        return assertReturn(InfoPriceResponseCfdOnEtc, response)
      }

      case 'Etf': {
        return assertReturn(InfoPriceResponseEtf, response)
      }

      case 'CfdOnEtf': {
        return assertReturn(InfoPriceResponseCfdOnEtf, response)
      }

      case 'Etn': {
        return assertReturn(InfoPriceResponseEtn, response)
      }

      case 'CfdOnEtn': {
        return assertReturn(InfoPriceResponseCfdOnEtn, response)
      }

      case 'Fund': {
        return assertReturn(InfoPriceResponseFund, response)
      }

      case 'CfdOnFund': {
        return assertReturn(InfoPriceResponseCfdOnFund, response)
      }

      case 'FuturesOption': {
        return assertReturn(InfoPriceResponseFuturesOption, response)
      }

      case 'FxForwards': {
        return assertReturn(InfoPriceResponseFxForwards, response)
      }

      case 'FxNoTouchOption': {
        return assertReturn(InfoPriceResponseFxNoTouchOption, response)
      }

      case 'FxOneTouchOption': {
        return assertReturn(InfoPriceResponseFxOneTouchOption, response)
      }

      case 'FxSpot': {
        return assertReturn(InfoPriceResponseFxSpot, response)
      }

      case 'FxSwap': {
        return assertReturn(InfoPriceResponseFxSwap, response)
      }

      case 'FxVanillaOption': {
        return assertReturn(InfoPriceResponseFxVanillaOption, response)
      }

      case 'Rights': {
        return assertReturn(InfoPriceResponseRights, response)
      }

      case 'CfdOnRights': {
        return assertReturn(InfoPriceResponseCfdOnRights, response)
      }

      default: {
        throw new Error('Unsupported asset type')
      }
    }
  }
}
