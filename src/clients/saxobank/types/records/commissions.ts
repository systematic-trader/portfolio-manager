import {
  type GuardType,
  number,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface Commissions extends GuardType<typeof Commissions> {}

export const Commissions = props({
  /** The cost to pay if instrument is bought */
  CostBuy: number(),

  /** The cost to pay for Ipo Subscription in case of Cash option */
  CostIpoCashSubscription: number(),

  /** The cost to pay for Ipo Subscription in case of Finance option */
  CostIpoSubscription: number(),

  /** The cost to pay if instrument is sold */
  CostSell: number(),
})
