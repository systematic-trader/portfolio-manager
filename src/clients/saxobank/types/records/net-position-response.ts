import {
  type GuardType,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Greeks } from './greeks.ts'
import { InstrumentDisplayAndFormat } from './instrument-display-and-format.ts'
import { InstrumentExchangeDetails } from './instrument-exchange-details.ts'
import { NetPositionDynamic } from './net-position-dynamic.ts'
import { NetPositionStatic } from './net-position-static.ts'

export interface NetPositionResponse extends GuardType<typeof NetPositionResponse> {}

export const NetPositionResponse = props({
  /** Information about the instrument of the net position and how to display it */
  DisplayAndFormat: InstrumentDisplayAndFormat,

  /** Information about the exchange where this instrument or the underlying instrument is traded */
  Exchange: InstrumentExchangeDetails,

  /** Greeks for option(s) i.e. FX Option, Contract Options and Contract Options CFD */
  Greeks: optional(Greeks),

  /** Static part of net position information */
  NetPositionBase: NetPositionStatic,

  /**
   * The id of the net position.
   * This can be used to fetch the open positions of a net position from the Positions service.
   */
  NetPositionId: string(),

  /** Dynamic part of net position information */
  NetPositionView: NetPositionDynamic,

  /** Information about the underlying instrument of the net position and how to display it */
  UnderlyingDisplayAndFormat: optional(InstrumentDisplayAndFormat),
})
