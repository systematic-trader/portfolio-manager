import type { AssetClass } from './types/derived/asset-class.ts'
import type { CountryCodeA2 } from './types/derived/country.ts'
import type { Currency3 } from './types/derived/currency.ts'

export interface Commision {
  readonly currency: Currency3
  /** The cost per contract commission. */
  readonly costPerContractCommission: number
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
  readonly symbol: string
  readonly currency: Currency3
  readonly country: CountryCodeA2
  readonly smartRouting: boolean
}

const E_MICRO_FUTURES = [
  'MES',
  'MNQ',
  'M2K',
  'VOLQ',
  'MYM',
  '2YY',
  '5YY',
  '10Y',
  '30Y',
  'MCL',
  'MRB',
  'MGC',
  'MWN',
  'MTN',
  'SIL',
  'VXM',
  'MHNG',
  'MHO',
  'MNK',
  'MNI',
]

export function whatIsCommision(options: CommissionOptions): Commision {
  if (options.assetClass === 'STK') {
    const assetType = options.assetClass in CostStructore ? CostStructore[options.assetClass] : undefined

    if (assetType === undefined) {
      throw new Error(`Asset type ${options.assetClass} is not supported.`)
    }

    let country: undefined | Record<string, Record<string, Commision>> = undefined

    switch (options.country) {
      case 'DK': {
        country = assetType.DK
        break
      }

      default: {
        throw new Error(`Country ${options.country} is not supported.`)
      }
    }

    let currency: undefined | Record<string, Commision> = undefined

    switch (options.currency) {
      case 'DKK': {
        currency = country.DKK
        break
      }

      default: {
        break
      }
    }

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

  if (options.assetClass === 'FUT' || options.assetClass === 'FOP') {
    if (options.country === 'CA') {
      return {
        currency: 'CAD',
        costPerContractCommission: 2.40,
        percentageCommission: 0,
        minimum: 0,
        minimumFractional: 0,
        maximum: undefined,
      }
    }

    if (options.country === 'MX') {
      return {
        currency: 'MXN',
        costPerContractCommission: 20,
        percentageCommission: 0,
        minimum: 0,
        minimumFractional: 0,
        maximum: undefined,
      }
    }

    if (options.country !== 'US') {
      throw new Error('Not implemented.')
    }

    if (E_MICRO_FUTURES.includes(options.symbol.toUpperCase())) {
      return {
        currency: 'USD',
        costPerContractCommission: 0.25,
        percentageCommission: 0,
        minimum: 0,
        minimumFractional: 0,
        maximum: undefined,
      }
    }

    if (false as boolean /* CME Cryptocurrency Futures and Futures Options */) {
      throw new Error('CME Cryptocurrency Futures and Futures Options are not supported.')
    }

    if (false as boolean /* E-mini FX Futures */) {
      throw new Error('E-mini FX Futures are not supported.')
    }

    if (false as boolean /* E-Micro FX Futures and 1OZ Gold Futures */) {
      throw new Error('E-Micro FX Futures and 1OZ Gold Futures are not supported.')
    }

    if (false as boolean /* Small Exchange Futures */) {
      throw new Error('Small Exchange Futures are not supported.')
    }

    switch (options.currency) {
      case 'AUD': {
        return {
          currency: 'AUD',
          costPerContractCommission: 0.95,
          percentageCommission: 0,
          minimum: 0,
          minimumFractional: 0,
          maximum: undefined,
        }
      }

      case 'CAD': {
        return {
          currency: 'CAD',
          costPerContractCommission: 0.85,
          percentageCommission: 0,
          minimum: 0,
          minimumFractional: 0,
          maximum: undefined,
        }
      }

      case 'CHF': {
        return {
          currency: 'CHF',
          costPerContractCommission: 0.95,
          percentageCommission: 0,
          minimum: 0,
          minimumFractional: 0,
          maximum: undefined,
        }
      }

      case 'CNH': {
        return {
          currency: 'CNH',
          costPerContractCommission: 5.5,
          percentageCommission: 0,
          minimum: 0,
          minimumFractional: 0,
          maximum: undefined,
        }
      }

      case 'EUR': {
        return {
          currency: 'EUR',
          costPerContractCommission: 0.65,
          percentageCommission: 0,
          minimum: 0,
          minimumFractional: 0,
          maximum: undefined,
        }
      }

      case 'GBP': {
        return {
          currency: 'GBP',
          costPerContractCommission: 0.60,
          percentageCommission: 0,
          minimum: 0,
          minimumFractional: 0,
          maximum: undefined,
        }
      }

      case 'HKD': {
        return {
          currency: 'HKD',
          costPerContractCommission: 7,
          percentageCommission: 0,
          minimum: 0,
          minimumFractional: 0,
          maximum: undefined,
        }
      }

      case 'JPY': {
        return {
          currency: 'JPY',
          costPerContractCommission: 85,
          percentageCommission: 0,
          minimum: 0,
          minimumFractional: 0,
          maximum: undefined,
        }
      }

      case 'SEK': {
        return {
          currency: 'SEK',
          costPerContractCommission: 6.5,
          percentageCommission: 0,
          minimum: 0,
          minimumFractional: 0,
          maximum: undefined,
        }
      }

      case 'SGD': {
        return {
          currency: 'SGD',
          costPerContractCommission: 1.20,
          percentageCommission: 0,
          minimum: 0,
          minimumFractional: 0,
          maximum: undefined,
        }
      }

      case 'USD': {
        return {
          currency: 'USD',
          costPerContractCommission: 0.85,
          percentageCommission: 0,
          minimum: 0,
          minimumFractional: 0,
          maximum: undefined,
        }
      }
    }

    return {
      currency: 'USD',
      costPerContractCommission: 0.85,
      percentageCommission: 0,
      minimum: 0,
      minimumFractional: 0,
      maximum: undefined,
    }
  }

  if (options.assetClass === 'ExchangeCurrency') {
    return {
      currency: 'USD',
      costPerContractCommission: 0,
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
          costPerContractCommission: 0,
          percentageCommission: 0.05,
          minimum: 49,
          minimumFractional: 10,
          maximum: undefined,
        },
        directRouting: {
          currency: 'DKK',
          costPerContractCommission: 0,
          percentageCommission: 0.1,
          minimum: 65,
          minimumFractional: 0,
          maximum: undefined,
        },
      },
    },
  },
} as const
