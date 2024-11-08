import {
  type GuardType,
  number,
  props,
  string,
  union,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

const ChartSampleBase = props({
  /** Time */
  Time: string({ format: 'date-iso8601' }),
})

export const ChartSampleBidAskOHLC = ChartSampleBase.merge(props({
  /** CloseAsk */
  CloseAsk: number(),

  /** CloseBid */
  CloseBid: number(),

  /** HighAsk */
  HighAsk: number(),

  /** HighBid */
  HighBid: number(),

  /** LowAsk */
  LowAsk: number(),

  /** LowBid */
  LowBid: number(),

  /** OpenAsk */
  OpenAsk: number(),

  /** OpenBid */
  OpenBid: number(),
}))

export interface ChartSampleBidAskOHLC extends GuardType<typeof ChartSampleBidAskOHLC> {}

export const ChartSampleOHLC = ChartSampleBase.merge(props({
  /** Close */
  Close: number(),

  /** High */
  High: number(),

  /** Interest */
  Interest: number(),

  /** Low */
  Low: number(),

  /** Open */
  Open: number(),

  /** Volume */
  Volume: number(),
}))

export interface ChartSampleOHLC extends GuardType<typeof ChartSampleOHLC> {}

export const ChartSample = union([ChartSampleOHLC, ChartSampleBidAskOHLC])

export type ChartSample = GuardType<typeof ChartSample>
