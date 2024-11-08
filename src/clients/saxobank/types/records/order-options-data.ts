import {
  type GuardType,
  number,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { PutCall } from '../derives/put-call.ts'

export interface OrderOptionsData extends GuardType<typeof OrderOptionsData> {}

export const OrderOptionsData = props({
  /** The ExpiryDate */
  ExpiryDate: string({ format: 'date-iso8601' }),

  /** The Put/Call value of the option */
  PutCall: PutCall,

  /** The strike price of the option */
  Strike: number(),
})
