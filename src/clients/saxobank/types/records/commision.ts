import {
  type GuardType,
  number,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derives/currency.ts'

export interface Commision extends GuardType<typeof Commision> {}

export const Commision = props({
  /** Fee in Percentage */
  Pct: optional(number()),

  /** Fee Rule */
  Rule: props({
    /** Fixed commmission that if present, will always be charged */
    BaseCommission: optional(number()),

    /** Currency */
    Currency: Currency3,

    /** Markup */
    Markup: optional(number()),

    /** Maximum commission applied if other commissions are above than this value */
    MaxCommission: optional(number()),

    /** Minimum commission applied if other commissions are lower than this value */
    MinCommission: optional(number()),

    /** Percentage */
    Pct: optional(number()),

    /** Commission per share (or lot) */
    PerUnitRate: optional(number()),

    /** Commission as a percentage of the amount traded */
    RateOnAmount: optional(number()),

    /** Value */
    Value: optional(number()),
  }),

  /** Fee Value */
  Value: number(),
})
