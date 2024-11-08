import {
  type GuardType,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derives/currency.ts'

export interface BaseFee extends GuardType<typeof BaseFee> {}

export const BaseFee = props({
  /** Fee in Percentage */
  Pct: optional(number()),

  /**
   * Fee Rule.
   */
  Rule: props({
    /** Currency */
    Currency: optional(Currency3),

    /** Markup */
    Markup: optional(number()),

    /** Percentage */
    Pct: optional(number()),

    /** Value */
    Value: optional(number()),
  }),

  /** Fee Value */
  Value: number(),
})
