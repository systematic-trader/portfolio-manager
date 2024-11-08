import {
  type GuardType,
  integer,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derives/currency.ts'

export interface Spread extends GuardType<typeof Spread> {}

export const Spread = props({
  /** Fee in Percentage */
  Pct: optional(number()),

  /** Fee Rule */
  Rule: props({
    /** Currency */
    Currency: optional(Currency3),

    /** Markup */
    Markup: optional(number()),

    /** Percentage */
    Pct: optional(number()),

    /** Value */
    Value: number(),
  }),

  /** Fee Value */
  Value: number(),

  /** The number of decimals used for display */
  DisplayDecimals: integer(),
})
