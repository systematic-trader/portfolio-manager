import {
  boolean,
  type GuardType,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface InstrumentExchangeDetails extends GuardType<typeof InstrumentExchangeDetails> {}

export const InstrumentExchangeDetails = props({
  /** Full name/description of the exchange */
  Description: string(),

  /** Short exchange code. */
  ExchangeId: string(),

  /** Indicates if the exchange is currently open for trading */
  IsOpen: boolean(),

  /** Exchange's TimeZone */
  TimeZoneId: string(),
})
