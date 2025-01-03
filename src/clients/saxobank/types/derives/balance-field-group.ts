import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type BalanceFieldGroup = GuardType<typeof BalanceFieldGroup>

export const BalanceFieldGroupValues = [
  /** Calculates cash available for trading from all accounts. */
  'CalculateCashForTrading',

  /** Include instrument margin utilization for positions on a client, account group or an account. */
  'MarginOverview',
] as const

export const BalanceFieldGroup = enums(BalanceFieldGroupValues)
