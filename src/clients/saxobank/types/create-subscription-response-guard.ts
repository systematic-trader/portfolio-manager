import {
  enums,
  type Guard,
  integer,
  type ObjectGuard,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export function createSubscriptionResponseGuard<T>(snapshotGuard: Guard<T>): ObjectGuard<{
  ContextId: Guard<string>
  Format: Guard<'application/json' | 'application/x-protobuf'>
  InactivityTimeout: Guard<number>
  ReferenceId: Guard<string>
  RefreshRate: Guard<number>
  Snapshot: Guard<T>
  State: Guard<string>
  Tag: Guard<string | undefined>
}> {
  return props({
    ContextId: string(),
    Format: enums(['application/json', 'application/x-protobuf']),
    InactivityTimeout: integer(),
    ReferenceId: string(),
    RefreshRate: integer({ minimum: 1000 }),
    Snapshot: snapshotGuard,
    State: string(),
    Tag: optional(string()),
  })
}
