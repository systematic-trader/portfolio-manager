import {
  type GuardType,
  number,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from './currency.ts'

export interface ServiceFee extends GuardType<typeof ServiceFee> {}

export const ServiceFee = props({
  /** Fee in Percentage. */
  Pct: number(),

  /** Fee Rule */
  Rule: props({
    /** Currency */
    Currency: Currency3,

    /** Markup */
    Markup: number(),

    /** Maximum monthly Custody fee that will be charged. */
    MaxFee: number(),

    /** Percentage */
    Pct: number(),

    /** Value */
    Value: number(),
  }),

  /** Fee Value. */
  Value: number(),
})