import {
  type GuardType,
  number,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface TickSizeSchemeElement extends GuardType<typeof TickSizeSchemeElement> {}

export const TickSizeSchemeElement = props({
  /** The tick size of this element applies to prices less than or equal to this value */
  HighPrice: number(),

  /** The tick size of this element */
  TickSize: number(),
})
