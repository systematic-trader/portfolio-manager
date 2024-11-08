import {
  type GuardType,
  integer,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Horizon } from '../derives/horizon.ts'

export interface ChartInfo extends GuardType<typeof ChartInfo> {}

export const ChartInfo = props({
  /** If the pricefeed is delayed, this field will be returned indicating the delay in minutes */
  DelayedByMinutes: integer(),

  /** Id of the Exchange. Go to the ReferenceData/Exhanges endpoint to get exchange session info */
  ExchangeId: string(),

  /**
   * The time of the first (oldest) available sample available for this instrument.
   * Useful for the client when calculating the size of the horizontal slider.
   */
  FirstSampleTime: string({ format: 'date-iso8601' }),

  /** Horizon in minutes */
  Horizon: Horizon,
})
