import {
  type GuardType,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { CountryCodeA2 } from '../derives/country.ts'

export interface ExchangeSummary extends GuardType<typeof ExchangeSummary> {}

export const ExchangeSummary = props({
  /** The ISO 3166-2 country code of the exchange's country */
  CountryCode: CountryCodeA2,

  /** The unique ID of the exchange */
  ExchangeId: string(),

  /** This is the same as ShortDescription in the database */
  Name: string(),

  /** This is the same as SourceAttributionDescription in the database */
  PriceSourceName: optional(string()),

  /** Exchange's TimeZone */
  TimeZoneId: string(),
})
