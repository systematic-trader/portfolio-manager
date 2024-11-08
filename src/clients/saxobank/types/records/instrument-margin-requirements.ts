import {
  array,
  type GuardType,
  literal,
  number,
  props,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const InstrumentMarginRequirements = array(
  union([
    props({
      MarginType: literal('Absolute'),
      ExtraWeek: number(),
      Initial: number(),
      IntraWeek: number(),
    }),

    props({
      MarginType: literal('Percentage'),
      ExtraWeek: number(),
      Initial: number(),
      IntraWeek: number(),
    }),
  ]),
)

export type InstrumentMarginRequirements = GuardType<typeof InstrumentMarginRequirements>
