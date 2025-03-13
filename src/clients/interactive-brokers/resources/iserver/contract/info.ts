import {
  boolean,
  type GuardType,
  literal,
  number,
  pattern,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import type { InteractiveBrokersResourceClient } from '../../../resource-client.ts'
import { AssetClass } from '../../../types/derived/asset-class.ts'
import { Currency3 } from '../../../types/derived/currency.ts'
import { ExchangeCode } from '../../../types/derived/exchange-code.ts'

export const BondContractInfo = props({
  allow_sell_long: boolean(),
  company_name: string(),
  con_id: number(),
  contract_clarification_type: literal('BOND_SIMPLE'),
  contract_month: pattern(/^\d{6}$/), // YYYYMM
  currency: Currency3,
  cusip: string(),
  exchange: ExchangeCode,
  expiry_full: pattern(/^\d{6}$/), // YYYYMM
  instrument_type: AssetClass.extract(['BOND']),
  is_zero_commission_security: boolean(),
  local_symbol: string(),
  maturity_date: pattern(/^\d{8}$/), // YYYYMMDD
  r_t_h: boolean(),
  smart_available: boolean(),
  symbol: string(),
  text: string(),
  trading_class: string(),
  underlying_con_id: number(),
  valid_exchanges: string(),
})

export interface BondContractInfo extends GuardType<typeof BondContractInfo> {}

export const CashContractInfo = props({
  allow_sell_long: boolean(),
  company_name: string(),
  con_id: number(),
  currency: Currency3,
  exchange: ExchangeCode,
  instrument_type: AssetClass.extract(['CASH']),
  is_zero_commission_security: boolean(),
  local_symbol: string(), // "EUR.USD"
  r_t_h: boolean(),
  symbol: string(), // "EUR"
  trading_class: string(), // "EUR.USD"
  underlying_con_id: number(),
  valid_exchanges: string(), // comma separated list of exchange codes
})

export interface CashContractInfo extends GuardType<typeof CashContractInfo> {}

export const FutureContractInfo = props({
  allow_sell_long: boolean(),
  company_name: string(),
  con_id: number(),
  contract_month: pattern(/^\d{6}$/), // YYYYMM
  currency: Currency3,
  exchange: ExchangeCode,
  expiry_full: pattern(/^\d{6}$/), // YYYYMM
  instrument_type: AssetClass.extract(['FUT']),
  is_zero_commission_security: boolean(),
  local_symbol: string(), // E7H5
  maturity_date: pattern(/^\d{8}$/), // YYYYMMDD
  multiplier: string(),
  r_t_h: boolean(),
  symbol: string(), // 'E7'
  text: string(),
  trading_class: string(), // 'E7'
  underlying_con_id: number(),
  valid_exchanges: string(), // comma separated list of exchange codes
})

export interface FutureContractInfo extends GuardType<typeof FutureContractInfo> {}

export const StockContractInfo = props({
  allow_sell_long: boolean(),
  category: string(),
  company_name: string(),
  con_id: number(),
  currency: Currency3,
  exchange: ExchangeCode,
  industry: string(),
  instrument_type: AssetClass.extract(['STK']),
  is_zero_commission_security: boolean(),
  local_symbol: string(),
  r_t_h: boolean(),
  smart_available: boolean(),
  symbol: string(),
  trading_class: string(),
  underlying_con_id: number(),
  valid_exchanges: string(),
})

export interface StockContractInfo extends GuardType<typeof StockContractInfo> {}

export const ContractInfo = union([BondContractInfo, CashContractInfo, FutureContractInfo, StockContractInfo])

export type ContractInfo = GuardType<typeof ContractInfo>

type AssetClassRecord = {
  readonly BOND: BondContractInfo
  readonly CASH: CashContractInfo
  readonly FUT: FutureContractInfo
  readonly STK: StockContractInfo
}

export class Info {
  readonly #client: InteractiveBrokersResourceClient

  constructor(client: InteractiveBrokersResourceClient) {
    this.#client = client
  }

  /**
   * Requests full contract details for the given conid
   */
  async get(
    { conid }: { readonly conid: number },
    { signal, timeout }: { readonly signal?: undefined | AbortSignal; readonly timeout?: undefined | number } = {},
  ): Promise<ContractInfo> {
    return await this.#client.get({
      path: `${conid}/info`,
      guard: ContractInfo,
      signal,
      timeout,
    })
  }

  async getByAssetClass<T extends keyof AssetClassRecord & AssetClass>(
    { assetClass, conid }: { readonly assetClass: T; readonly conid: number },
    { signal, timeout }: { readonly signal?: undefined | AbortSignal; readonly timeout?: undefined | number } = {},
  ): Promise<AssetClassRecord[T]> {
    const path = `${conid}/info`

    switch (assetClass) {
      case 'BOND': {
        return await this.#client.get({
          path,
          guard: BondContractInfo,
          signal,
          timeout,
        }) as AssetClassRecord[T]
      }

      case 'CASH': {
        return await this.#client.get({
          path,
          guard: CashContractInfo,
          signal,
          timeout,
        }) as AssetClassRecord[T]
      }

      case 'FUT': {
        return await this.#client.get({
          path,
          guard: FutureContractInfo,
          signal,
          timeout,
        }) as AssetClassRecord[T]
      }

      case 'STK': {
        return await this.#client.get({
          path,
          guard: StockContractInfo,
          signal,
          timeout,
        }) as AssetClassRecord[T]
      }

      default: {
        throw new Error(`Unsupported asset class: ${assetClass}`)
      }
    }
  }
}
