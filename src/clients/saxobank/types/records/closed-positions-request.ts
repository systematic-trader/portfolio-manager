import {
  array,
  type GuardType,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ClosedPositionFieldGroup } from '../derives/closed-position-field-group.ts'

export interface ClosedPositionsRequest extends GuardType<typeof ClosedPositionsRequest> {}

export const ClosedPositionsRequest = props({
  /** The key of the account group to which the net positions belongs */
  AccountGroupKey: optional(string()),

  /** The key of the account to which the net positions belongs */
  AccountKey: optional(string()),

  /** The key of the client to which the net positions belongs */
  ClientKey: string(),

  /** The id of the closed position to which the closedposition belongs */
  ClosedPositionId: optional(string()),

  /** Specifies which data to return. Default is [PositionBase,PositionView] */
  FieldGroups: optional(array(ClosedPositionFieldGroup)),
})
