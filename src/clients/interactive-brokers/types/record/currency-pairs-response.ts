import {
  array,
  type GuardType,
  integer,
  props,
  record,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derived/currency.ts'

export const CurrencyPairs = array(props({
  symbol: string(),
  conid: integer(),
  ccyPair: Currency3,
}))

export interface CurrencyPairs extends GuardType<typeof CurrencyPairs> {}

export const CurrencyPairsResponse = record(Currency3, CurrencyPairs)

export interface CurrencyPairsResponse extends GuardType<typeof CurrencyPairsResponse> {}
