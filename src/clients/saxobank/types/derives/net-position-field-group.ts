import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type NetPositionFieldGroup = GuardType<typeof NetPositionFieldGroup>

export const NetPositionFieldGroup = enums([
  /** Information about the instrument of the net position and how to display it */
  'DisplayAndFormat',

  /** Adds information about the instrument's exchange. This includes Exchange name, exchange code and open status */
  'ExchangeInfo',

  /** Greeks for Option(s), only applicable to Fx Options , Contract Options and Contract options CFD */
  'Greeks',

  /** NetPosition data which does not change whether viewed at client or account level */
  'NetPositionBase',

  /** NetPosition, data which is calculated differently whether viewed at client or account level */
  'NetPositionView',
])
