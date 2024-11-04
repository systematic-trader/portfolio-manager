import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type BalanceFieldGroup = GuardType<typeof BalanceFieldGroup>

export const BalanceFieldGroup = enums([
  /** Calculates cash available for trading from all accounts. */
  'CalculateCashForTrading',

  /** Include instrument margin utilization for positions on a client, account group or an account. */
  'MarginOverview',
])
