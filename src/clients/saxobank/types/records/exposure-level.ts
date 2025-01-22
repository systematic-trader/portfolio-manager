import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const ExposureLevel = enums([
  /** Exposure By asset */
  'Asset',

  /** Exposure By base contract gross */
  'BaseContractGross',

  /** Exposure By base contract net */
  'BaseContractNet',

  /** Exposure By Currency */
  'Currency',

  /** FX Net Open Positions Value (combined negative currency exposure across all currencies) the client is limited to in a specified currency */
  'FxNOP',

  /** Exposure By instrument */
  'Instrument',

  /** Exposure By issuer */
  'Issuer',

  /** Unknown */
  'Unknown',
])

export type ExposureLevel = GuardType<typeof ExposureLevel>
