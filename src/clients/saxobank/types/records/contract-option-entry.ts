import {
  array,
  format,
  type GuardType,
  integer,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ContractOption } from '../derives/contract-option.ts'
import { TickSizeScheme } from './tick-size-scheme.ts'

export interface ContractOptionEntry extends GuardType<typeof ContractOptionEntry> {}

export const ContractOptionEntry = props({
  /** The days to expiry to use for display purposes. */
  DisplayDaysToExpiry: integer(),
  /** The days to Last Trade to use for display purposes. */
  DisplayDaysToLastTradeDate: integer(),
  /** The expiry date to use for display purposes. */
  DisplayExpiry: format('gregorian-date'),
  /** The Expiry Date */
  Expiry: format('gregorian-date'),
  /** The Last Trade Date */
  LastTradeDate: format('date-iso8601'),
  /** List of specific options for the specified expiry date. This array will only be available for the dates specified in the request (OptionSpace, ExpiryDates) */
  SpecificOptions: optional(array(ContractOption)),
  /** The current tick size scheme of the expiry group. */
  TickSizeScheme: optional(TickSizeScheme),
})
