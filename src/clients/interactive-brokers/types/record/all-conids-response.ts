import {
  array,
  type GuardType,
  integer,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ExchangeCode } from '../derived/exchange-code.ts'

export const AllConidsResponse = optional(array(props({
  ticker: string(),
  conid: integer(),
  exchange: ExchangeCode,
})))

export type AllConidsResponse = GuardType<typeof AllConidsResponse>
