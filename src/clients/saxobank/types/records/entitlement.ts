import {
  array,
  type GuardType,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType } from '../derives/asset-type.ts'

export interface Entitlement extends GuardType<typeof Entitlement> {}

export const Entitlement = props({
  /** AssetTypes where user has delayed top of book access on prices */
  DelayedFullBook: optional(array(AssetType)),

  /** AssetTypes where user has delayed access on greeks */
  DelayedGreeks: optional(array(AssetType)),

  /** AssetTypes where user has real time access on greeks */
  Greeks: optional(array(AssetType)),

  /** AssetTypes where user has real time full book access on prices */
  RealTimeFullBook: optional(array(AssetType)),

  /** AssetTypes where user has real time top of book access on prices */
  RealTimeTopOfBook: optional(array(AssetType)),
})
