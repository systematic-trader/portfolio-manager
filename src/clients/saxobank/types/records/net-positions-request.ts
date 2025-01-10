import {
  array,
  type GuardType,
  integer,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType } from '../derives/asset-type.ts'
import { NetPositionFieldGroup } from '../derives/net-position-field-group.ts'
import { PutCall } from '../derives/put-call.ts'

export interface NetPositionsRequest extends GuardType<typeof NetPositionsRequest> {}

export const NetPositionsRequest = props({
  /** The key of the account group to which the positions belong */
  AccountGroupKey: optional(string()),

  /** The key of the account to which the positions belong */
  AccountKey: optional(string()),

  /** Optional. The AssetType */
  AssetType: optional(AssetType),

  /** The key of the client to which the positions belong */
  ClientKey: string(),

  /** Optional. The expiry date. Only used to distinguish FxOptions */
  ExpiryDate: optional(string({ format: 'date-iso8601' })),

  /** Specifies which data to return. Default is [NetPositionBase,NetPositionView] */
  FieldGroups: optional(array(NetPositionFieldGroup)),

  /** Optional. The Lower Barrier. Only used to distinguish Fx Barrier Options */
  LowerBarrier: optional(number()),

  /** Optional. The id of the netposition */
  NetPositionId: optional(string()),

  /** Optional. Put or Call. Only used to distinguish FxOptions */
  PutCall: optional(PutCall),

  /** Optional. The strike price of the option. Only used to distinguish FxOptions */
  Strike: optional(number()),

  /** Optional. Unique id of the instrument */
  Uic: optional(integer()),

  /** Optional. The Upper Barrier. Only used to distinguish Fx Barrier Options */
  UpperBarrier: optional(number()),

  /** Optional. The value date. Only used to distinguish FxForwards */
  ValueDate: optional(string({ format: 'date-iso8601' })),

  /** Optional. Watchlist Id.Filter on watchlist instruments */
  WatchlistId: optional(string()),
})
