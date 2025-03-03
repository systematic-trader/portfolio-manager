import type { AssetClass } from './types/derived/asset-class.ts'
import type { Currency3 } from './types/derived/currency.ts'

export interface Commision {
  readonly currency: Currency3
  /** The cost in percentage of the order value. */
  readonly percentageCommission: number
  /** The minimum cost of the commission. */
  readonly minimum: number
  /** The minimum cost of the commission in fractional. */
  readonly minimumFractional: number
  /** The maximum cost of the commission. */
  readonly maximum: undefined | number
}

export interface CommissionOptions {
  readonly assetClass: AssetClass | 'ExchangeCurrency'
  readonly currency: 'DKK' // Currency3
  readonly country: 'DK' // CountryCodeA2
  readonly smartRouting: boolean
}

export function whatIsCommision(options: CommissionOptions): Commision {
  if (options.assetClass === 'STK') {
    const assetType = options.assetClass in CostStructore ? CostStructore[options.assetClass] : undefined

    if (assetType === undefined) {
      throw new Error(`Asset type ${options.assetClass} is not supported.`)
    }

    const country = options.country in assetType ? assetType[options.country] : undefined

    if (country === undefined) {
      throw new Error(`Country ${options.country} is not supported.`)
    }

    const currency = options.currency in country ? country[options.currency] : undefined

    if (currency === undefined) {
      throw new Error(`Currency ${options.currency} is not supported.`)
    }

    const routing = options.smartRouting ? 'smartRouting' : 'directRouting'

    const commission = routing in currency ? currency[routing] : undefined

    if (commission === undefined) {
      throw new Error(`Routing ${routing} is not supported.`)
    }

    return commission
  }

  if (options.assetClass === 'ExchangeCurrency') {
    return {
      currency: 'USD',
      percentageCommission: 0.00002,
      minimum: 2,
      minimumFractional: 0,
      maximum: undefined,
    }
  }

  throw new Error(`Asset class ${options.assetClass} is not supported.`)
}

const CostStructore = {
  STK: {
    DK: {
      DKK: {
        smartRouting: {
          currency: 'DKK',
          percentageCommission: 0.05,
          minimum: 49,
          minimumFractional: 10,
          maximum: undefined,
        },
        directRouting: {
          currency: 'DKK',
          percentageCommission: 0.1,
          minimum: 65,
          minimumFractional: 0,
          maximum: undefined,
        },
      },
    },
  },
} as const
