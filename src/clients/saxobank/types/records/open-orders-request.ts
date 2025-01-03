import {
  array,
  type GuardType,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { OrderFieldGroup } from '../derives/order-field-group.ts'
import { OrderStatusFilter } from '../derives/order-status-filter.ts'

export interface OpenOrdersRequest extends GuardType<typeof OpenOrdersRequest> {}

export const OpenOrdersRequest = props({
  /** The key of the account group to which the order belongs */
  AccountGroupKey: optional(string()),

  /** Unique key identifying the account that owns the orders */
  AccountKey: optional(string()),

  /** Unique key identifying the client that owns the orders */
  ClientKey: string(),

  /** Specifies which data to return. Default is empty, meaning Display and Formatting information is not included */
  FieldGroups: optional(array(OrderFieldGroup)),

  /** The id of the order */
  OrderId: optional(string()),

  /** Selects only a subset of open orders to be returned. Default is to return working orders only. */
  Status: optional(OrderStatusFilter),

  /** Selects only orders those instruments belongs to the given watchlist id */
  WatchlistId: optional(string()),
})
