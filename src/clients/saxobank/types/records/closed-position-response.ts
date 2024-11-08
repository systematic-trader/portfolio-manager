import {
  type GuardType,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ClosedPosition } from './closed-position.ts'
import { InstrumentDisplayAndFormat } from './instrument-display-and-format.ts'
import { InstrumentExchangeDetails } from './instrument-exchange-details.ts'

export interface ClosedPositionResponse extends GuardType<typeof ClosedPositionResponse> {}

export const ClosedPositionResponse = props({
  /** ClosedPosition info */
  ClosedPosition: ClosedPosition,

  /** Unique id of the closed position based on OpeningPositionId and ClosingPositionId - Required for subscription to provide a key */
  ClosedPositionUniqueId: string(),

  /** Information about the instrument of the closed position and how to display it */
  DisplayAndFormat: InstrumentDisplayAndFormat,

  /** Information about the instrument's exchange and trading status */
  Exchange: InstrumentExchangeDetails,

  /** NetPosition ID */
  NetPositionId: string(),
})
