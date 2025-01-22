import {
  type GuardType,
  number,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derives/currency.ts'
import { ExposureLevel } from './exposure-level.ts'
import { ExposureLimitRuleType } from './exposure-limit-rule-type.ts'

export const Exposure = props({
  /** Currency if the limit is a value. */
  Currency: Currency3,

  /** The exposure identifier. */
  Identifier: string(),

  /** Value in number of units of the instrument (shares, lots, etc.). */
  Level: ExposureLevel,

  /** Exposure limit rule type. */
  RuleType: ExposureLimitRuleType,

  /** The exposure value. */
  Value: number(),
})

export interface Exposure extends GuardType<typeof Exposure> {}
