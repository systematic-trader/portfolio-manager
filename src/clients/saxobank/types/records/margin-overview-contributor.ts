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
import { DisplayHintType } from '../derives/display-hint-type.ts'

export interface MarginOverviewContributor extends GuardType<typeof MarginOverviewContributor> {}

export const MarginOverviewContributor = props({
  /** AssetTypes for this contributor */
  AssetTypes: array(AssetType),

  /** Hint to the client application about how it should display the instrument. */
  DisplayHint: optional(DisplayHintType),

  /**
   * Description of instrument.
   * Not available for futures.
   */
  InstrumentDescription: string(),

  /**
   * Instrument identifier.
   * Base contract for futures and symbol for other instruments.
   */
  InstrumentSpecifier: string(),

  /** Margin impact of the contributor */
  Margin: number(),

  /** Uic identifying the instrument, if any */
  Uic: integer(),
})
