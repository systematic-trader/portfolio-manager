import {
  type GuardType,
  number,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derives/currency.ts'

export interface InterAccountTransferResponse extends GuardType<typeof InterAccountTransferResponse> {}

export const InterAccountTransferResponse = props({
  /** Commission charged to transfer amount */
  Commission: number(),

  /** Amount from the sender account */
  FromAccountAmount: number(),

  /** Currency from the sender account */
  FromAccountCurrency: Currency3,

  /** Amount to the receiver account */
  ToAccountAmount: number(),

  /** Currency to the receiver account */
  ToAccountCurrency: Currency3,
})
