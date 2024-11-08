import { format, props } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ExchangeSessionState } from '../derives/exchange-session-state.ts'

export const ExchangeSession = props({
  /** UTC date and time of when the state ends */
  EndTime: format('date-iso8601'),

  /** UTC date and time of when the state starts */
  StartTime: format('date-iso8601'),

  State: ExchangeSessionState,
})
