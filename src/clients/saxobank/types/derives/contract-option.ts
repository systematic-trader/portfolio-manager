import {
  type GuardType,
  integer,
  number,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { PutCall } from './put-call.ts'
import { TradingStatus } from './trading-status.ts'

/** Information about a specific option entry, where the expiration date is given by the enclosing ContractOptionEntry */
export const ContractOption = props({
  /** Put or Call option */
  PutCall,

  /** The strike price */
  StrikePrice: number(),

  /** The trading status of the Contract option */
  TradingStatus,

  /**
   * The uic of this particular Option with expiry determined by parent structure,
   * and strike and put/call as specified by the entry
   */
  Uic: integer(),

  /** Uic of the underlying instrument for this particular option */
  UnderlyingUic: integer(),
})

export interface ContractOption extends GuardType<typeof ContractOption> {}
