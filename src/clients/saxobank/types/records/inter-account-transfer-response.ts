import {
  type GuardType,
  number,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface InterAccountTransferResponse extends GuardType<typeof InterAccountTransferResponse> {}

export const InterAccountTransferResponse = props({
  /** Commission charged to transfer amount */
  Commission: number(),

  /** Amount from the sender account */
  FromAccountAmount: number(),

  /** Currency from the sender account */
  FromAccountCurrency: string(),

  /** Amount to the receiver account */
  ToAccountAmount: number(),

  /** Currency to the receiver account */
  ToAccountCurrency: string(),
})
