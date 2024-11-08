import {
  type GuardType,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const TimeZoneDetails = props({
  /** Full name/description of the time zone */
  DisplayName: string(),

  /** Time Zone Abbreviation for UTC standard time */
  TimeZoneAbbreviation: optional(string()),

  /** Internal unique time zone identifier */
  TimeZoneId: string(),

  /** Time Zone Offset */
  TimeZoneOffset: string(),

  /** The IANA/tz database time zone identifier */
  ZoneName: string(),
})

export interface TimeZoneDetails extends GuardType<typeof TimeZoneDetails> {}
