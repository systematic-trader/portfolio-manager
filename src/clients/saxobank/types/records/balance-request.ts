import {
  array,
  type GuardType,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { BalanceFieldGroup } from '../derives/balance-field-group.ts'

export interface BalanceRequest extends GuardType<typeof BalanceRequest> {}

export const BalanceRequest = props({
  /** The key of the account group for which the balance data is returned */
  AccountGroupKey: optional(string()),

  /** The key of the account for which the balance data is returned */
  AccountKey: optional(string()),

  /** The key of the client for which the balance data is returned */
  ClientKey: string(),

  /** Specifies which data to return. */
  FieldGroups: optional(array(BalanceFieldGroup)),
})
