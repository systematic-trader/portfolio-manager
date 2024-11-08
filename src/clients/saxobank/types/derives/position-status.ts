import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type PositionStatus = GuardType<typeof PositionStatus>

export const PositionStatus = enums([
  /** Closed */
  'Closed',

  /** Closing with market order */
  'Closing',

  /** Locked by back office */
  'Locked',

  /** Open */
  'Open',

  /** Partially closed */
  'PartiallyClosed',

  /** Related closing position */
  'RelatedClose',

  /**
   * Implicitly closed.
   * Used for Net Positions only.
   */
  'Square',
])
