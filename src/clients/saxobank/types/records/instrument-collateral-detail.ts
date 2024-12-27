import {
  array,
  type GuardType,
  integer,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType } from '../derives/asset-type.ts'

export interface InstrumentCollateralDetail extends GuardType<typeof InstrumentCollateralDetail> {}

export const InstrumentCollateralDetail = props({
  /**	Instrument Asset type */
  AssetType: AssetType,

  /**	Instrument Description */
  Description: string(),

  /**	Initial collateral available of the instrument */
  InitialCollateral: number(),

  /**	Initial collateral not available of the instrument */
  InitialCollateralNotAvailable: number(),

  /** Initial concentration risk haircuts */
  InitialConcentrationDeduction: number(),

  /**	Maintenance collateral available of the instrument */
  MaintenanceCollateral: number(),

  /**	Maintenance collateral not available of the instrument */
  MaintenanceCollateralNotAvailable: number(),

  /** Not documented */
  MaintenanceConcentrationDeduction: number(),

  /**	Market value of the instrument */
  MarketValue: number(),

  /**	Instrument Symbol */
  Symbol: string(),

  /**	Uic of the instrument */
  Uic: integer(),

  /** Not documented */
  ContributingAssetTypes: optional(array(AssetType)),
})
