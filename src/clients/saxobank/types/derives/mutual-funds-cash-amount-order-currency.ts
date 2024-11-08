import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type MutualFundsCashAmountOrderCurrency = GuardType<typeof MutualFundsCashAmountOrderCurrency>

export const MutualFundsCashAmountOrderCurrency = enums([
  /** Use the specified account currency */
  'Account',

  /** Use the currency of the specified instrument */
  'Instrument',
])
