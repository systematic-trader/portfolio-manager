import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type CorrelationType = GuardType<typeof CorrelationType>

export const CorrelationType = enums([
  /** Entity is part of a trade allocation */
  'Allocation',

  /** Entity originated for an options assignment. */
  'Assignment',

  /** Entity originated for an automatic options assignment. */
  'AutoAssignment',

  /** Entity originated from an automatic options exercise. */
  'AutoExercise',

  /** Entity originated from an AutoTrade */
  'AutoTrade',

  /** Entity originated from a CopyTrade */
  'CopyTrade',

  /** Entity originated from an options exercise. */
  'Exercise',

  /** Entity originated from an External Deal Capture */
  'ExternalDealCapture',

  /** Entity originated from an Internal Deal Capture */
  'InternalDealCapture',
])
