import {
  boolean,
  type GuardType,
  number,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ExpiryCut } from '../derives/expiry-cut.ts'
import { PutCall } from '../derives/put-call.ts'

export interface FXOptionsBaseData extends GuardType<typeof FXOptionsBaseData> {}

export const FXOptionsBaseData = props({
  /** True if the barrier event has occurred for the option */
  BarrierEventOccurred: boolean(),

  /** ExpiryCut */
  ExpiryCut: ExpiryCut,

  /** The ExpiryDate */
  ExpiryDate: string({ format: 'date-iso8601' }),

  /** LowerBarrier for digital option */
  LowerBarrier: number(),

  /** The Put/Call value of the option */
  PutCall: PutCall,

  /** The strike price of the option */
  Strike: number(),

  /** UpperBarrier for digital option */
  UpperBarrier: number(),
})
