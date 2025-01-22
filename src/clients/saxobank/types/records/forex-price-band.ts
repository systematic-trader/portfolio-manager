import {
  boolean,
  integer,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { SpreadType } from './spread-types.ts'

export const ForexPriceBand = props({
  /** Indicates if autoexecute is enabled */
  AutoExecuteEnabled: boolean(),

  /** Indicates if autoquote is enabled */
  AutoQuoteEnabled: boolean(),

  /** The number of decimals used for display */
  DisplayDecimals: integer(),

  /** The Maximum Band */
  MaxBand: optional(number()),

  /** The Minimum Band */
  MinBand: optional(number()),

  /** The spread */
  Spread: number(),

  /** The spread type */
  SpreadType,

  /** The upper trade limit where the spread applies */
  UpperBandLimit: number(),
})
