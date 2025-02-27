import {
  array,
  type GuardType,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const AccountsResponse = props({
  accounts: array(string()),
}, {
  extendable: true, // todo remove this when we have a better idea of the shape
})

export type AccountsResponse = GuardType<typeof AccountsResponse>
