import {
  boolean,
  type GuardType,
  number,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ExerciseStyle } from '../derives/exercise-style.ts'
import { ExpiryCut } from '../derives/expiry-cut.ts'
import { PutCall } from '../derives/put-call.ts'
import { SettlementStyle } from '../derives/settlement-style.ts'

export interface OptionsData extends GuardType<typeof OptionsData> {}

export const OptionsData = props({
  /** True if the barrier event has occurred for the option */
  BarrierEventOccurred: boolean(),

  /** If true, the option position may be exercised by the user */
  CanBeExercised: boolean(),

  /**
   * Used to indicate if an option is to follow American or European style exercise rules.
   * American-style may be exercised at any time.
   * European-style may only be exercised at expiry.
   */
  ExerciseStyle: ExerciseStyle,

  /** ExpiryCut */
  ExpiryCut: ExpiryCut,

  /** The ExpiryDate */
  ExpiryDate: string({ format: 'date-iso8601' }),

  /** LowerBarrier for digital option */
  LowerBarrier: number(),

  /** Forex Options premium date */
  PremiumDate: string({ format: 'date-iso8601' }),

  /** The Put/Call value of the option */
  PutCall: PutCall,

  /** The settlement style of the option */
  SettlementStyle: SettlementStyle,

  /** The strike price of the option */
  Strike: number(),

  /** UpperBarrier for digital option */
  UpperBarrier: number(),
})
