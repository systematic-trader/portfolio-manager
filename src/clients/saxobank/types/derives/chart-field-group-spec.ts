import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type ChartFieldGroupSpec = GuardType<typeof ChartFieldGroupSpec>

export const ChartFieldGroupSpec = enums([
  /** Add field group ChartInfo to get additional information about the OHLC samples */
  'ChartInfo',

  /**
   * Add FieldGroup Data to include the OHLC samples.
   * If omitted while other field groups are included then the samples are not included in the response.
   */
  'Data',

  /** Add FieldGroup DisplayAndFormat to include formatting and display information about the instrument */
  'DisplayAndFormat',
])
