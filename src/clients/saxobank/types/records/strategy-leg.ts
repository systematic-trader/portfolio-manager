import {
  type GuardType,
  integer,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType } from '../derives/asset-type.ts'
import { BuySell } from '../derives/buy-sell.ts'

export interface StrategyLeg extends GuardType<typeof StrategyLeg> {}

export const StrategyLeg = props({
  AssetType,
  BuySell: BuySell,
  Description: optional(string()),
  LegNumber: integer(),
  Multiplier: number(),
  Uic: integer(),
})
