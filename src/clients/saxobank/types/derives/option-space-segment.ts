import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type OptionSpaceSegment = GuardType<typeof OptionSpaceSegment>

export const OptionSpaceSegment = enums([
  /** Return complete option space */
  'AllDates',

  /** Return all options for the "default" days */
  'DefaultDates',

  /** Do not include the option space */
  'None',

  /** Return all options for specified strike days */
  'SpecificDates',

  /** Used to specify filter to return all options for with specified underlying Uic */
  'UnderlyingUic',
])
