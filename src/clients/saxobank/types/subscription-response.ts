import {
  type Guard,
  integer,
  type ObjectGuard,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export function subscriptionResponseGuard<T>(snapshotGuard: Guard<T>): ObjectGuard<{
  ContextId: Guard<string>
  Format: Guard<string>
  InactivityTimeout: Guard<number>
  ReferenceId: Guard<string>
  RefreshRate: Guard<number>
  Snapshot: Guard<T>
  State: Guard<string>
  Tag: Guard<string | undefined>
}> {
  return props({
    ContextId: string(),
    Format: string(),
    InactivityTimeout: integer(),
    ReferenceId: string(),
    RefreshRate: integer(),
    Snapshot: snapshotGuard,
    State: string(),
    Tag: optional(string()),
  })
}
