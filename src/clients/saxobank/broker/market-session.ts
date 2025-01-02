import type { InstrumentDetailsUnion } from '../types/records/instrument-details.ts'
import type { InstrumentSession } from '../types/records/instrument-session.ts'

export type MarketSession =
  | MarketSessionClosed
  | MarketSessionBreak
  | MarketSessionExtended
  | MarketSessionOpened
  | MarketSessionSuspended

type ISO8601 = `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`

export interface MarketSessionClosed {
  readonly state: 'Closed'
  readonly reason: string
  readonly executable: false
  readonly startTime: ISO8601
  readonly endTime: ISO8601
  readonly next: NextMarketSession<
    MarketSessionBreak | MarketSessionExtended | MarketSessionOpened | MarketSessionSuspended
  >
}

export interface MarketSessionBreak {
  readonly state: 'Break'
  readonly reason: string
  readonly executable: false
  readonly startTime: ISO8601
  readonly endTime: ISO8601
  readonly next: NextMarketSession<
    MarketSessionClosed | MarketSessionExtended | MarketSessionOpened | MarketSessionSuspended
  >
}

export interface MarketSessionExtended {
  readonly state: 'Extended'
  readonly reason: string
  readonly executable: boolean
  readonly startTime: ISO8601
  readonly endTime: ISO8601
  readonly next: NextMarketSession<
    MarketSessionClosed | MarketSessionBreak | MarketSessionOpened | MarketSessionSuspended
  >
}

export interface MarketSessionOpened {
  readonly state: 'Open'
  readonly reason: string
  readonly executable: true
  readonly startTime: ISO8601
  readonly endTime: ISO8601
  readonly next: NextMarketSession<
    MarketSessionBreak | MarketSessionExtended | MarketSessionClosed | MarketSessionSuspended
  >
}

export interface MarketSessionSuspended {
  readonly state: 'Suspended'
  readonly reason: string
  readonly executable: false
  readonly startTime: ISO8601
  readonly endTime: ISO8601
  readonly next: NextMarketSession<
    MarketSessionBreak | MarketSessionExtended | MarketSessionClosed | MarketSessionOpened
  >
}

type UnionKeys<T> = T extends unknown ? keyof T : never
type OptionalKeys<T> = T extends unknown ? { [K in keyof T]: undefined extends T[K] ? K : never }[keyof T] : never
type RequiredKeys<T> = {
  [K in Exclude<UnionKeys<T>, OptionalKeys<T>>]: undefined extends T[K] ? never : K
}[Exclude<UnionKeys<T>, OptionalKeys<T>>]

type PickInstrumentDetails<T, K extends UnionKeys<T> = UnionKeys<T>> =
  & {
    [P in Extract<OptionalKeys<T>, K>]?: T extends unknown ? P extends keyof T ? T[P] : undefined : never
  }
  & {
    [P in Extract<RequiredKeys<T>, K>]: T extends unknown ? P extends keyof T ? T[P] : never : never
  }

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

export type NextMarketSession<T extends { readonly next: unknown }> =
  & Omit<T, 'next'>
  & { readonly next: undefined | NextMarketSession<T> }

export function mapInstrumentSessions(
  instrument: PickInstrumentDetails<
    InstrumentDetailsUnion,
    'TradingSessions' | 'AssetType' | 'Symbol' | 'Uic' | 'IsExtendedTradingHoursEnabled'
  >,
): MarketSession {
  const sortedSessions = instrument.TradingSessions.Sessions
    .toSorted((left, right) => new Date(left.StartTime).getTime() - new Date(right.StartTime).getTime())

  for (let i = 0; i < sortedSessions.length - 1; i++) {
    const current = sortedSessions[i] as Writeable<InstrumentSession>
    const next = sortedSessions[i + 1]

    if (next === undefined) {
      break
    }

    if (current.State === next.State && current.EndTime === next.StartTime) {
      current.EndTime = next.EndTime
      sortedSessions.splice(i + 1, 1)
      i--
    }
  }

  if (sortedSessions.length === 0) {
    throw new Error(
      `No market sessions for asset "${instrument.AssetType}" on "${instrument.Symbol}" (UIC ${instrument.Uic})`,
    )
  }

  const sessions = sortedSessions.map<Writeable<MarketSession['next']>>((session) => {
    switch (session.State) {
      case 'Closed':
      case 'PitTrading': {
        return {
          state: 'Closed',
          reason: session.State,
          executable: false,
          startTime: session.StartTime as MarketSession['startTime'],
          endTime: session.EndTime as MarketSession['endTime'],
          next: undefined,
        }
      }

      case 'Break': {
        return {
          state: 'Break',
          reason: session.State,
          executable: false,
          startTime: session.StartTime as MarketSession['startTime'],
          endTime: session.EndTime as MarketSession['endTime'],
          next: undefined,
        }
      }

      case 'PreMarket':
      case 'PreAutomatedTrading':
      case 'PreTrading':
      case 'OpeningAuction':
      case 'PostAutomatedTrading':
      case 'PostMarket':
      case 'PostTrading':
      case 'TradingAtLast':
      case 'CallAuctionTrading': {
        return {
          state: 'Extended',
          reason: session.State,
          executable: instrument.IsExtendedTradingHoursEnabled ?? false,
          startTime: session.StartTime as MarketSession['startTime'],
          endTime: session.EndTime as MarketSession['endTime'],
          next: undefined,
        }
      }

      case 'Auction':
      case 'AutomatedTrading': {
        return {
          state: 'Open',
          reason: session.State,
          executable: true,
          startTime: session.StartTime as MarketSession['startTime'],
          endTime: session.EndTime as MarketSession['endTime'],
          next: undefined,
        }
      }

      case 'Halt':
      case 'Suspended': {
        return {
          state: 'Suspended',
          reason: session.State,
          executable: false,
          startTime: session.StartTime as MarketSession['startTime'],
          endTime: session.EndTime as MarketSession['endTime'],
          next: undefined,
        }
      }

      default: {
        throw new Error(`Unknown session state: ${session.State as string}`)
      }
    }
  })

  for (let i = 0; i < sessions.length - 1; i++) {
    // deno-lint-ignore no-non-null-assertion
    sessions[i]!.next = sessions[i + 1]
  }

  return sessions[0] as MarketSession
}
