import {
  assertReturn,
  enums,
  type GuardType,
  integer,
  literal,
  number,
  type ObjectGuard,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InfoPriceGroupSpec } from '../../types/derives/info-price-group-spec.ts'
import type { OrderAmountType } from '../../types/derives/order-amount-type.ts'

import { extractKeys } from '../../../../utils/object.ts'
import type { ServiceGroupClient } from '../../service-group-client.ts'
import { PutCall } from '../../types/derives/put-call.ts'
import { ToOpenClose } from '../../types/derives/to-open-close.ts'
import { InfoPriceResponse } from '../../types/records/info-price-response.ts'

const InfoPricesBaseParameters = props({
  AssetType: enums(extractKeys(InfoPriceResponse)),
  AccountKey: optional(string()),
  Uic: integer(),
  Amount: optional(number()),
  ToOpenClose: optional(ToOpenClose),
})

export interface InfoPricesBaseParameters extends GuardType<typeof InfoPricesBaseParameters> {}

export const InfoPricesParametersBond = InfoPricesBaseParameters.merge({
  AssetType: literal('Bond'),
})

export interface InfoPricesParametersBond extends GuardType<typeof InfoPricesParametersBond> {}

export const InfoPricesParametersCfdOnIndex = InfoPricesBaseParameters.merge({
  AssetType: literal('CfdOnIndex'),
})

export interface InfoPricesParametersCfdOnIndex extends GuardType<typeof InfoPricesParametersCfdOnIndex> {}

export const InfoPricesParametersCompanyWarrant = InfoPricesBaseParameters.merge({
  AssetType: literal('CompanyWarrant'),
})

export interface InfoPricesParametersCompanyWarrant extends GuardType<typeof InfoPricesParametersCompanyWarrant> {}

export const InfoPricesParametersCfdOnCompanyWarrant = InfoPricesBaseParameters.merge({
  AssetType: literal('CfdOnCompanyWarrant'),
})

export interface InfoPricesParametersCfdOnCompanyWarrant
  extends GuardType<typeof InfoPricesParametersCfdOnCompanyWarrant> {}

export const InfoPricesParametersStock = InfoPricesBaseParameters.merge({
  AssetType: literal('Stock'),
})

export interface InfoPricesParametersStock extends GuardType<typeof InfoPricesParametersStock> {}

export const InfoPricesParametersCfdOnStock = InfoPricesBaseParameters.merge({
  AssetType: literal('CfdOnStock'),
})

export interface InfoPricesParametersCfdOnStock extends GuardType<typeof InfoPricesParametersCfdOnStock> {}

export const InfoPricesParametersStockIndexOption = InfoPricesBaseParameters.merge({
  AssetType: literal('StockIndexOption'),
})

export interface InfoPricesParametersStockIndexOption extends GuardType<typeof InfoPricesParametersStockIndexOption> {}

export const InfoPricesParametersStockOption = InfoPricesBaseParameters.merge({
  AssetType: literal('StockOption'),
})

export interface InfoPricesParametersStockOption extends GuardType<typeof InfoPricesParametersStockOption> {}

export const InfoPricesParametersContractFutures = InfoPricesBaseParameters.merge({
  AssetType: literal('ContractFutures'),
})

export interface InfoPricesParametersContractFutures extends GuardType<typeof InfoPricesParametersContractFutures> {}

export const InfoPricesParametersCfdOnFutures = InfoPricesBaseParameters.merge({
  AssetType: literal('CfdOnFutures'),
})

export interface InfoPricesParametersCfdOnFutures extends GuardType<typeof InfoPricesParametersCfdOnFutures> {}

export const InfoPricesParametersEtc = InfoPricesBaseParameters.merge({
  AssetType: literal('Etc'),
})

export interface InfoPricesParametersEtc extends GuardType<typeof InfoPricesParametersEtc> {}

export const InfoPricesParametersCfdOnEtc = InfoPricesBaseParameters.merge({
  AssetType: literal('CfdOnEtc'),
})

export interface InfoPricesParametersCfdOnEtc extends GuardType<typeof InfoPricesParametersCfdOnEtc> {}

export const InfoPricesParametersEtf = InfoPricesBaseParameters.merge({
  AssetType: literal('Etf'),
})

export interface InfoPricesParametersEtf extends GuardType<typeof InfoPricesParametersEtf> {}

export const InfoPricesParametersCfdOnEtf = InfoPricesBaseParameters.merge({
  AssetType: literal('CfdOnEtf'),
})

export interface InfoPricesParametersCfdOnEtf extends GuardType<typeof InfoPricesParametersCfdOnEtf> {}

export const InfoPricesParametersEtn = InfoPricesBaseParameters.merge({
  AssetType: literal('Etn'),
})

export interface InfoPricesParametersEtn extends GuardType<typeof InfoPricesParametersEtn> {}

export const InfoPricesParametersCfdOnEtn = InfoPricesBaseParameters.merge({
  AssetType: literal('CfdOnEtn'),
})

export interface InfoPricesParametersCfdOnEtn extends GuardType<typeof InfoPricesParametersCfdOnEtn> {}

export const InfoPricesParametersFund = InfoPricesBaseParameters.merge({
  AssetType: literal('Fund'),
})

export interface InfoPricesParametersFund extends GuardType<typeof InfoPricesParametersFund> {}

export const InfoPricesParametersCfdOnFund = InfoPricesBaseParameters.merge({
  AssetType: literal('CfdOnFund'),
})

export interface InfoPricesParametersCfdOnFund extends GuardType<typeof InfoPricesParametersCfdOnFund> {}

export const InfoPricesParametersFuturesOption = InfoPricesBaseParameters.merge({
  AssetType: literal('FuturesOption'),
})

export interface InfoPricesParametersFuturesOption extends GuardType<typeof InfoPricesParametersFuturesOption> {}

export const InfoPricesParametersFxForwards = InfoPricesBaseParameters.merge({
  AssetType: literal('FxForwards'),
  ForwardDate: optional(string({ format: 'date-iso8601' })),
})

export interface InfoPricesParametersFxForwards extends GuardType<typeof InfoPricesParametersFxForwards> {}

export const InfoPricesParametersFxNoTouchOption = InfoPricesBaseParameters.merge({
  AssetType: literal('FxNoTouchOption'),
  ExpiryDate: string({ format: 'date-iso8601' }),
  LowerBarrier: optional(number()),
  UpperBarrier: optional(number()),
})

export interface InfoPricesParametersFxNoTouchOption extends GuardType<typeof InfoPricesParametersFxNoTouchOption> {}

export const InfoPricesParametersFxOneTouchOption = InfoPricesBaseParameters.merge({
  AssetType: literal('FxOneTouchOption'),
  ExpiryDate: string({ format: 'date-iso8601' }),
  LowerBarrier: optional(number()),
  UpperBarrier: optional(number()),
})

export interface InfoPricesParametersFxOneTouchOption extends GuardType<typeof InfoPricesParametersFxOneTouchOption> {}

export const InfoPricesParametersFxSpot = InfoPricesBaseParameters.merge({
  AssetType: literal('FxSpot'),
})

export interface InfoPricesParametersFxSpot extends GuardType<typeof InfoPricesParametersFxSpot> {}

export const InfoPricesParametersFxSwap = InfoPricesBaseParameters.merge({
  AssetType: literal('FxSwap'),
  ForwardDateNearLeg: string({ format: 'date-iso8601' }),
  ForwardDateFarLeg: string({ format: 'date-iso8601' }),
})

export interface InfoPricesParametersFxSwap extends GuardType<typeof InfoPricesParametersFxSwap> {}

export const InfoPricesParametersFxVanillaOption = InfoPricesBaseParameters.merge({
  AssetType: literal('FxVanillaOption'),
  PutCall: PutCall,
  ExpiryDate: string({ format: 'date-iso8601' }),
})

export interface InfoPricesParametersFxVanillaOption extends GuardType<typeof InfoPricesParametersFxVanillaOption> {}

export const InfoPricesParametersRights = InfoPricesBaseParameters.merge({
  AssetType: literal('Rights'),
})

export interface InfoPricesParametersRights extends GuardType<typeof InfoPricesParametersRights> {}

export const InfoPricesParametersCfdOnRights = InfoPricesBaseParameters.merge({
  AssetType: literal('CfdOnRights'),
})

export interface InfoPricesParametersCfdOnRights extends GuardType<typeof InfoPricesParametersCfdOnRights> {}

export const InfoPricesParameters = {
  Bond: InfoPricesParametersBond,
  CfdOnIndex: InfoPricesParametersCfdOnIndex,
  CompanyWarrant: InfoPricesParametersCompanyWarrant,
  CfdOnCompanyWarrant: InfoPricesParametersCfdOnCompanyWarrant,
  Stock: InfoPricesParametersStock,
  CfdOnStock: InfoPricesParametersCfdOnStock,
  StockIndexOption: InfoPricesParametersStockIndexOption,
  StockOption: InfoPricesParametersStockOption,
  ContractFutures: InfoPricesParametersContractFutures,
  CfdOnFutures: InfoPricesParametersCfdOnFutures,
  Etc: InfoPricesParametersEtc,
  CfdOnEtc: InfoPricesParametersCfdOnEtc,
  Etf: InfoPricesParametersEtf,
  CfdOnEtf: InfoPricesParametersCfdOnEtf,
  Etn: InfoPricesParametersEtn,
  CfdOnEtn: InfoPricesParametersCfdOnEtn,
  Fund: InfoPricesParametersFund,
  CfdOnFund: InfoPricesParametersCfdOnFund,
  FuturesOption: InfoPricesParametersFuturesOption,
  FxForwards: InfoPricesParametersFxForwards,
  FxNoTouchOption: InfoPricesParametersFxNoTouchOption,
  FxOneTouchOption: InfoPricesParametersFxOneTouchOption,
  FxSpot: InfoPricesParametersFxSpot,
  FxSwap: InfoPricesParametersFxSwap,
  FxVanillaOption: InfoPricesParametersFxVanillaOption,
  Rights: InfoPricesParametersRights,
  CfdOnRights: InfoPricesParametersCfdOnRights,
}

export type InfoPricesParameters = {
  Bond: InfoPricesParametersBond
  CfdOnIndex: InfoPricesParametersCfdOnIndex
  CompanyWarrant: InfoPricesParametersCompanyWarrant
  CfdOnCompanyWarrant: InfoPricesParametersCfdOnCompanyWarrant
  Stock: InfoPricesParametersStock
  CfdOnStock: InfoPricesParametersCfdOnStock
  StockIndexOption: InfoPricesParametersStockIndexOption
  StockOption: InfoPricesParametersStockOption
  ContractFutures: InfoPricesParametersContractFutures
  CfdOnFutures: InfoPricesParametersCfdOnFutures
  Etc: InfoPricesParametersEtc
  CfdOnEtc: InfoPricesParametersCfdOnEtc
  Etf: InfoPricesParametersEtf
  CfdOnEtf: InfoPricesParametersCfdOnEtf
  Etn: InfoPricesParametersEtn
  CfdOnEtn: InfoPricesParametersCfdOnEtn
  Fund: InfoPricesParametersFund
  CfdOnFund: InfoPricesParametersCfdOnFund
  FuturesOption: InfoPricesParametersFuturesOption
  FxForwards: InfoPricesParametersFxForwards
  FxNoTouchOption: InfoPricesParametersFxNoTouchOption
  FxOneTouchOption: InfoPricesParametersFxOneTouchOption
  FxSpot: InfoPricesParametersFxSpot
  FxSwap: InfoPricesParametersFxSwap
  FxVanillaOption: InfoPricesParametersFxVanillaOption
  Rights: InfoPricesParametersRights
  CfdOnRights: InfoPricesParametersCfdOnRights
}

export class InfoPrices {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('v1/infoprices')
  }

  async get<AssetType extends keyof InfoPriceResponse>(
    parameters:
      & ({
        /** The instrument's asset type */
        readonly AssetType: AssetType

        /** Unique instrument identifier */
        readonly Uic: InfoPricesBaseParameters['Uic']

        /**
         * Unique key identifying the account used in retrieving the infoprice.
         * Only required when calling context represents an authenticated user.
         * If not supplied a default account is assumed.
         */
        readonly AccountKey?: InfoPricesBaseParameters['AccountKey']

        /** Order size, defaults to minimal order size for given instrument. */
        readonly Amount?: InfoPricesBaseParameters['Amount']

        /** Specifies whether the order will be created to open/increase or close/decrease a position (only relevant for options). */
        readonly ToOpenClose?: InfoPricesBaseParameters['ToOpenClose']
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
          readonly ForwardDate?: InfoPricesParameters[AssetType]['ForwardDate']
        }
        : object)
      & (AssetType extends 'FxNoTouchOption' | 'FxOneTouchOption' | 'FxVanillaOption' ? {
          /**
           * Required for asset types: FxNoTouchOption, FxOneTouchOption and FxVanillaOption.
           *
           * This parameter for Fx options behaves like the ForwardDate for forwards.
           * If an expiry date is a bank holiday, the API will use the next following bank day as expiry date and return the corrected date in the InstrumentPriceDetails field group's ExpiryDate field.
           */
          readonly ExpiryDate: InfoPricesParameters[AssetType]['ExpiryDate']
        }
        : object)
      & (AssetType extends 'FxNoTouchOption' | 'FxOneTouchOption' ? {
          /**
           * For FxOneTouch and FxNoTouch option, only one of these fields can be set.
           * If none is provided, the API automatically picks a LowerBarrier value.
           * The chosen LowerBarrier value is returned as LowerBarrier in the InstrumentPriceDetails field group.
           */
          readonly LowerBarrier?: InfoPricesParameters[AssetType]['LowerBarrier']

          /**
           * For FxOneTouch and FxNoTouch option, only one of these fields can be set.
           * If none is provided, the API automatically picks a LowerBarrier value.
           * The chosen LowerBarrier value is returned as LowerBarrier in the InstrumentPriceDetails field group.
           */
          readonly UpperBarrier?: InfoPricesParameters[AssetType]['UpperBarrier']
        }
        : object)
      & (AssetType extends 'FxVanillaOption' ? {
          /**
           * Required for asset types: FxVanillaOption
           */
          readonly PutCall: InfoPricesParameters[AssetType]['PutCall']
        }
        : object)
      & (AssetType extends 'FxSwap' ? {
          /**
           * Required for asset types: FxSwap.
           *
           * Forward date for near leg.
           */
          readonly ForwardDateNearLeg: InfoPricesParameters['FxSwap']['ForwardDateNearLeg']

          /**
           * Required for asset types: FxSwap.
           *
           * Forward date for far leg.
           */
          readonly ForwardDateFarLeg: InfoPricesParameters['FxSwap']['ForwardDateFarLeg']
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

    const assertedParameters = assertReturn(InfoPricesParameters[parameters.AssetType] as ObjectGuard, parameters)

    const searchParams = {
      AmountType,
      FieldGroups,
      ...assertedParameters,
    }

    const response = await this.#client.get<object>({
      searchParams,
      timeout: options.timeout,
    })

    switch (parameters.AssetType) {
      case 'Bond': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'CfdOnIndex': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'CompanyWarrant': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'CfdOnCompanyWarrant': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'Stock': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'CfdOnStock': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'StockIndexOption': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'StockOption': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'ContractFutures': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'CfdOnFutures': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'Etc': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'CfdOnEtc': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'Etf': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'CfdOnEtf': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'Etn': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'CfdOnEtn': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'Fund': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'CfdOnFund': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'FuturesOption': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'FxForwards': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'FxNoTouchOption': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'FxOneTouchOption': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'FxSpot': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'FxSwap': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'FxVanillaOption': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'Rights': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      case 'CfdOnRights': {
        return assertReturn(InfoPriceResponse[parameters.AssetType], response)
      }

      default: {
        throw new Error('Unsupported asset type')
      }
    }
  }
}
