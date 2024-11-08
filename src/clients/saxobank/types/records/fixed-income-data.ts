import {
  type GuardType,
  number,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface FixedIncomeData extends GuardType<typeof FixedIncomeData> {}

export const FixedIncomeData = props({
  /** Part of the close price that accounts for the Accrued Interest */
  ClosedAccruedInterest: number(),

  /** Part of the close price that accounts for the Accrued Interest in reqesting client/account currency */
  ClosedAccruedInterestInBaseCurrency: number(),

  /** Part of the open price that accounts for the Accrued Interest */
  OpenAccruedInterest: number(),

  /** Part of the open price that accounts for the Accrued Interest in reqesting client/account currency */
  OpenAccruedInterestInBaseCurrency: number(),
})
