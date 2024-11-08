import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type NonTradableReason = GuardType<typeof NonTradableReason>

export const NonTradableReason = enums([
  /** The issuer has not provided a Key Information Document (KID) for this instrument */
  'ETFsWithoutKIIDs',

  /** This instrument has expired */
  'ExpiredInstrument',

  /** None */
  'None',

  /** Short selling is not available for this instrument */
  'NonShortableInstrument',

  /** This instrument is not tradable */
  'NotOnlineClientTradable',

  /** This instrument is tradable offline */
  'OfflineTradableBonds',

  /** This instrument is not tradable */
  'OtherReason',

  /** This instrument is not reduce-only */
  'ReduceOnlyInstrument',

  /** The issuer has not provided a Key Information Document (KID) for this instrument */
  'WithoutKIIDs',
])
