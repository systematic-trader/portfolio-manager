import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type ExerciseStyle = GuardType<typeof ExerciseStyle>

export const ExerciseStyle = enums([
  /**
   * American Option.
   * Can be exercised prior to expiry date.
   */
  'American',

  /**
   * European Option.
   * Must be exercised on expiry date.
   */
  'European',

  /** Option not defined */
  'None',
])
