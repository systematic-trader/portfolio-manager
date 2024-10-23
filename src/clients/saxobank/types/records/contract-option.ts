import {
  type GuardType,
  integer,
  number,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { PutCall } from '../derives/put-call.ts'
import { TradingStatus } from '../derives/trading-status.ts'

/** Information about a specific option entry, where the expiration date is given by the enclosing ContractOptionEntry */
export const ContractOption = props({
  /** Put or Call option */
  PutCall,
  /** The strike price */
  StrikePrice: number(),
  /** The trading status of the Contract option */
  TradingStatus,
  /**  */
  Uic: integer(),
  /** Uic of the underlying instrument for this particular option */
  UnderlyingUic: integer(),
})

export interface ContractOption extends GuardType<typeof ContractOption> {}
