import {
  array,
  boolean,
  type GuardType,
  integer,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ExchangeSession } from '../records/exchange-session.ts'
import { CountryCodeA2 } from './country.ts'
import { Currency3 } from './currency.ts'

export interface ExchangeDetails extends GuardType<typeof ExchangeDetails> {}

export const ExchangeDetails = props({
  /** Is exchange open or closed all day */
  AllDay: boolean(),

  /** The ISO 3166-2 country code of the exchange's country */
  CountryCode: CountryCodeA2,

  /** The base currency of the exchange */
  Currency: Currency3,

  /** The unique ID of the exchange */
  ExchangeId: string(),

  /** The exchange start and end times in UTC */
  ExchangeSessions: optional(array(ExchangeSession)),

  /**
   * ISO 10383 Market Identifier Code.
   * A single operating exchange (see `OperatingMIC`) can have one or more individual (sub)markets.
   */
  IsoMic: optional(string()),

  /**
   * Market Identifier Code used by Saxo to identify a specific market,
   * which can be different from `IsoMic` and is used in instrument symbols and as price source fields.
   */
  Mic: string(),

  /** This is the same as ShortDescription in the database */
  Name: string(),

  /**
   * ISO 10383 Operating Market Identifier Code, which identifies the operating exchange.
   * A single operating exchange can have one or more individual markers, identified by their own MICs (see `IsoMic`).
   */
  OperatingMic: optional(string()),

  /** This is the same as SourceAttributionDescription in the database */
  PriceSourceName: optional(string()),

  /** The exchange's time zone */
  TimeZone: integer(),

  /** The exchange's time zone abbreviation */
  TimeZoneAbbreviation: optional(string()),

  /** Exchange's TimeZone */
  TimeZoneId: optional(string()),

  /** The time zone offset from UTC */
  TimeZoneOffset: string(),
})
