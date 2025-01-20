import {
  array,
  integer,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ExchangeSession } from './exchange-session.ts'

export const InstrumentTradeSessions = props({
  Sessions: array(ExchangeSession),
  TimeZone: integer(),
  TimeZoneAbbreviation: optional(string()),
  TimeZoneOffset: string(),
})
