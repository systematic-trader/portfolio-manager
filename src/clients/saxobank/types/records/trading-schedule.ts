import {
  array,
  type GuardType,
  integer,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ExchangeSession } from './exchange-session.ts'

export const TradingSchedule = props({
  Sessions: array(ExchangeSession),
  TimeZone: integer(),
  TimeZoneAbbreviation: string(),
  TimeZoneOffset: string(),
})

export interface TradingSchedule extends GuardType<typeof TradingSchedule> {}
