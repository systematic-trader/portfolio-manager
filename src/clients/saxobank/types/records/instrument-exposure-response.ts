import {
  boolean,
  type GuardType,
  integer,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType } from '../derives/asset-type.ts'
import { CalculationReliability } from '../derives/calculation-reliability.ts'
import { PutCall } from '../derives/put-call.ts'
import { InstrumentDisplayAndFormat } from './instrument-display-and-format.ts'

export interface InstrumentExposureResponse extends GuardType<typeof InstrumentExposureResponse> {}

export const InstrumentExposureResponse = props({
  /** Sum exposure of positions in instrument */
  Amount: number(),

  /** The AssetType */
  AssetType: AssetType,

  /** The average price of all the positions that make up the exposure */
  AverageOpenPrice: number(),

  /** If an error was encountered this code indicates source of the calculation error */
  CalculationReliability: CalculationReliability,

  /** Indicates if the exposure may be closed */
  CanBeClosed: boolean(),

  /** Information about the instrument and how to display it */
  DisplayAndFormat: InstrumentDisplayAndFormat,

  /** The ExpiryDate */
  ExpiryDate: optional(string({ format: 'date-iso8601' })),

  /** Percent change in instrument's price between Previous Close and current Last Traded price */
  InstrumentPriceDayPercentChange: number(),

  /** LowerBarrier for digital option */
  LowerBarrier: optional(number()),

  /**
   * The exposure net position id.
   * May be used to fetch the net position or open positions of the net position from the Open Positions service.
   */
  NetPositionId: string(),

  /** The P/L on the trade in the currency in which the instrument is traded */
  ProfitLossOnTrade: number(),

  /** The Put/Call value of the option */
  PutCall: optional(PutCall),

  /** The strike price of the option */
  Strike: optional(number()),

  /** Unique id of the instrument */
  Uic: integer(),

  /** UpperBarrier for digital option */
  UpperBarrier: optional(number()),

  /**
   * The value date.
   * Only used to distinguish FxForwards.
   */
  ValueDate: optional(string({ format: 'date-iso8601' })),
})
