import {
  type GuardType,
  integer,
  number,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { BuySell } from '../derives/buy-sell.ts'
import { OptionsStrategyType } from '../derives/options-strategy-type.ts'

export interface MultiLegOrderDetails extends GuardType<typeof MultiLegOrderDetails> {}

export const MultiLegOrderDetails = props({
  /**
   * Amount for the multi-leg order.
   * Each leg may have independent amounts.
   */
  Amount: number(),

  /**
   * Buy/sell direction for the multi-leg order.
   * Each leg may point in independent directions.
   */
  BuySell: BuySell,

  /**
   * The user specific(delayed/realtime) current market price of the multi-leg order.
   */
  CurrentPrice: number(),

  /** Description of the multi-leg order */
  Description: string(),

  /**
   * Distance to market for this multi-leg order.
   * (Dynamically updating)
   */
  DistanceToMarket: number(),

  /** Amount for the multi-leg order that has already been filled */
  FilledAmount: number(),

  /** Number of orders that make up the multi-leg order */
  LegCount: integer(),

  /**
   * Unique identifier for the multi-leg order.
   * Same for all legs.
   */
  MultiLegOrderId: string(),

  /** Overall limit price for the multi-leg order */
  Price: number(),

  /** The enumeration If the legs match a common options strategy */
  StrategyType: OptionsStrategyType,
})
