import {
  type GuardType,
  integer,
  number,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derives/currency.ts'

export interface RolloverFee extends GuardType<typeof RolloverFee> {}

export const RolloverFee = props({
  /** Fee in Percentage */
  Pct: number(),

  /**
   * Fee Rule
   */
  Rule: props({
    /** Currency */
    Currency: Currency3,

    /** Markup */
    Markup: number(),

    /** The number of rollovers */
    NumberOfRollovers: integer(),

    /** Percentage */
    Pct: number(),

    /** Value */
    Value: number(),
  }),

  /** Fee Value */
  Value: number(),
})
