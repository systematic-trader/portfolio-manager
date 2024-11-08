import {
  array,
  type GuardType,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType } from '../derives/asset-type.ts'
import { DurationType } from '../derives/duration-type.ts'
import { OrderType } from '../derives/order-type.ts'
import { StrategyParameter } from '../derives/strategy-parameter.ts'

export interface Strategy extends GuardType<typeof Strategy> {}

export const Strategy = props({
  Description: string(),
  MinAmountUSD: number(),
  Name: string(),
  Parameters: optional(array(StrategyParameter)),
  SupportedDurationTypes: array(DurationType),
  SupportedOrderTypes: array(OrderType),
  TradableInstrumentTypes: array(AssetType),
})
