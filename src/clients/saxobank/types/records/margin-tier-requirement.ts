import {
  array,
  type GuardType,
  number,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derives/currency.ts'

export const MarginTierRequirement = props({
  TierCurrency: Currency3,
  Entries: array(props({
    TierLowerBound: number(),
    IntraWeekMarginRate: number(),
    InitialMarginRate: number(),
    ExtraWeekMarginRate: number(),
  })),
})

export interface MarginTierRequirement extends GuardType<typeof MarginTierRequirement> {}
