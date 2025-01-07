import {
  array,
  type GuardType,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { PositionFieldGroup } from '../derives/position-field-group.ts'

export interface PositionsRequest extends GuardType<typeof PositionsRequest> {}

export const PositionsRequest = props({
  /** The key of the account group to which the net positions belongs */
  AccountGroupKey: optional(string()),

  /** The key of the account to which the net positions belongs */
  AccountKey: optional(string()),

  /** The key of the client to which the net positions belongs */
  ClientKey: string(),

  /** Specifies which data to return. Default is [PositionBase,PositionView] */
  FieldGroups: optional(array(PositionFieldGroup)),

  /** The id of the netposition to which the position belongs */
  NetPositionId: optional(string()),

  /** The id of the position */
  PositionId: optional(string()),

  /** Selects only positions those instruments belongs to the given watchlist id */
  WatchlistId: optional(string()),
})
