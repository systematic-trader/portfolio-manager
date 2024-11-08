import {
  array,
  boolean,
  type GuardType,
  integer,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType } from '../derives/asset-type.ts'
import { LanguageCodeA2 } from '../derives/language.ts'
import { LoginStatus } from '../derives/login-status.ts'

export interface UserResponse extends GuardType<typeof UserResponse> {}

export const UserResponse = props({
  /** Whether the user is active */
  Active: boolean(),

  /** Unique key identifying the client that owns the user */
  ClientKey: string(),

  /**
   * Selected culture for this user.
   * Five letter language culture name.
   * Fx. en-GB.
   */
  Culture: string(),

  /**
   * Selected language for this user.
   * The two letter ISO 639-1 language code.
   * See Reference Data Languages endpoint for supported languages.
   */
  Language: LanguageCodeA2,

  /** Status of last login or login attempt */
  LastLoginStatus: LoginStatus,

  /** Time of last login or login attempt */
  LastLoginTime: string({ format: 'date-iso8601' }),

  /** Asset Types that can be traded on all accounts by this user */
  LegalAssetTypes: array(AssetType),

  /** True if the user has accepted terms for market data via OpenApi access */
  MarketDataViaOpenApiTermsAccepted: boolean(),

  /** The name of the user */
  Name: string(),

  /**
   * Selected Time Zone for this user.
   * See Reference Data TimeZones endpoint for supported time zones.
   */
  TimeZoneId: integer(),

  /** Unique ID of the user */
  UserId: string({ format: 'integer' }),

  /** The unique key for the user */
  UserKey: string(),
})
