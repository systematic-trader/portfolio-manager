import {
  boolean,
  type GuardType,
  integer,
  number,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { SettlementType } from '../derives/settlement-type.ts'

export interface SettlementInstructions extends GuardType<typeof SettlementInstructions> {}

export const SettlementInstructions = props({
  /** The amount that will be rolled over */
  ActualRolloverAmount: number(),

  /** The amount of the net positions that is going to settle */
  ActualSettlementAmount: number(),

  /** The amount that is given by the client and stored as instructions */
  Amount: number(),

  /**
   * The liquidation date is the last day where the instructions can be updated
   * and it can be done till the exchange is open.
   */
  IsSettlementInstructionsAllowed: boolean(),

  /** SRD Calendar month */
  Month: integer(),

  /** Client's chosen settlement type */
  SettlementType: SettlementType,

  /** SRD Calendar year */
  Year: integer(),
})
