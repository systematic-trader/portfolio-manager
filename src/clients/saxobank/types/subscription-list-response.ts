import {
  array,
  enums,
  type Guard,
  integer,
  type ObjectGuard,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export function subscriptionListResponseGuard<T>(snapshotDataGuard: Guard<T>): ObjectGuard<{
  ContextId: Guard<string>
  Format: Guard<'application/json' | 'application/x-protobuf'>
  InactivityTimeout: Guard<number>
  ReferenceId: Guard<string>
  RefreshRate: Guard<number>
  Snapshot: Guard<
    {
      readonly Data: readonly T[] | undefined
      readonly __count: number | undefined
      readonly __next: string | undefined
      readonly MaxRows: number | undefined
    } | undefined
  >
  State: Guard<string>
  Tag: Guard<string | undefined>
}> {
  return props({
    ContextId: string(),
    Format: enums(['application/json', 'application/x-protobuf']),
    InactivityTimeout: integer(),
    ReferenceId: string(),
    RefreshRate: integer({ minimum: 1000 }),
    Snapshot: optional(props({
      Data: optional(array(snapshotDataGuard)),
      __count: optional(integer()),
      __next: optional(string()),
      MaxRows: optional(integer()),
    })),
    State: string(),
    Tag: optional(string()),
  })
}
