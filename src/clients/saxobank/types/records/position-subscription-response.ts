import {
  array,
  type GuardType,
  integer,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { createSubscriptionResponseGuard } from '../create-subscription-response-guard.ts'
import { PositionResponseUnion } from './position-response.ts'

export const PositionSubscriptionResponse = createSubscriptionResponseGuard(
  props({
    Data: optional(array(PositionResponseUnion)),
    MaxRows: integer(),
  }),
)

export interface PositionSubscriptionResponse extends GuardType<typeof PositionSubscriptionResponse> {}
