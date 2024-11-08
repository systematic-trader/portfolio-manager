import {
  array,
  type GuardType,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { InstrumentCollateralDetail } from './instrument-collateral-detail.ts'

export interface MarginCollateralNotAvailableDetail extends GuardType<typeof MarginCollateralNotAvailableDetail> {}

export const MarginCollateralNotAvailableDetail = props({
  /** Initial Fx Haircut */
  InitialFxHaircut: number(),

  /** Instrument collateral collection */
  InstrumentCollateralDetails: optional(array(InstrumentCollateralDetail)),

  /** Maintenance Fx Haircut */
  MaintenanceFxHaircut: number(),
})
