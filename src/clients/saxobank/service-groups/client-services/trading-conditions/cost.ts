import {
  assertReturn,
  enums,
  type GuardType,
  integer,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

import { extractKeys } from '../../../../../utils/object.ts'
import type { ServiceGroupClient } from '../../../service-group-client/service-group-client.ts'
import type { TradingConditionFieldGroup } from '../../../types/derives/trading-condition-field-group.ts'
import { CostResponse } from '../../../types/records/cost-response.ts'

const CostParametersGuard = props({
  AccountKey: string(),
  AssetType: enums(extractKeys(CostResponse)),
  Amount: number(),
  HoldingPeriodInDays: optional(integer()),
  Price: number(),
  Uic: integer(),
})

export interface CostParameters extends GuardType<typeof CostParametersGuard> {}

export class Cost {
  readonly #client: ServiceGroupClient

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    this.#client = client.appendPath('cost')
  }

  async get<AssetType extends keyof CostResponse>(
    parameters: {
      /** The account key to lookup the conditions for */
      readonly AccountKey: CostParameters['AccountKey']

      /** The number of asset to be traded. */
      readonly Amount: CostParameters['Amount']

      /** The assetType of the instrument to lookup */
      readonly AssetType: AssetType

      /** The holding period in days if provided else 1 day. */
      readonly HoldingPeriodInDays?: CostParameters['HoldingPeriodInDays']

      /**
       * The instrument price to be used for the calculation.
       * Required for all non-Saxo applications.
       */
      readonly Price: CostParameters['Price']

      /** The uic for the instrument to lookup */
      readonly Uic: CostParameters['Uic']
    },
    options?: { readonly timeout?: undefined | number },
  ): Promise<CostResponse[AssetType]>

  async get(
    parameters: CostParameters,
    options: { readonly timeout?: undefined | number } = {},
  ): Promise<CostResponse[keyof CostResponse]> {
    const { AccountKey, Amount, HoldingPeriodInDays, Price, Uic } = assertReturn(CostParametersGuard, parameters)

    const FieldGroups: readonly TradingConditionFieldGroup[] = ['DisplayAndFormat']

    const path = [AccountKey, Uic, parameters.AssetType].join('/')

    const searchParams = {
      Amount,
      FieldGroups,
      HoldingPeriodInDays,
      Price,
    }

    const response = await this.#client.get({
      path,
      searchParams,
      timeout: options.timeout,
    }).execute()

    switch (parameters.AssetType) {
      case 'Bond': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'CfdOnCompanyWarrant': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'CfdOnEtc': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'CfdOnEtf': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'CfdOnEtn': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'CfdOnFund': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'CfdOnFutures': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'CfdOnIndex': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'CfdOnRights': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'CfdOnStock': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'CompanyWarrant': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'ContractFutures': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'Etc': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'Etf': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'Etn': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'Fund': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'FuturesOption': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'FxForwards': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'FxNoTouchOption': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'FxOneTouchOption': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'FxSpot': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'FxSwap': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'FxVanillaOption': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'Rights': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'Stock': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'StockIndexOption': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }

      case 'StockOption': {
        return assertReturn(CostResponse[parameters.AssetType], response)
      }
    }
  }
}
