import {
  array,
  type GuardType,
  integer,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ExchangeCode } from '../derived/exchange-code.ts'

export const AllConidsResponse = array(props({
  ticker: string(),
  conid: integer(),
  exchange: ExchangeCode,
}))

export interface AllConidsResponse extends GuardType<typeof AllConidsResponse> {}
