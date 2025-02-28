import {
  type GuardType,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const DeleteOrderResponse = props({
  msg: string(),
  order_id: number(),
  conid: number(),
  account: optional(string()),
})

export interface DeleteOrderResponse extends GuardType<typeof DeleteOrderResponse> {}
