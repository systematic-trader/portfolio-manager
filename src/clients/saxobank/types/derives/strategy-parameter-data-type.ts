import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type StrategyParameterDataType = GuardType<typeof StrategyParameterDataType>

export const StrategyParameterDataType = enums([
  'Char',
  'Int',
  'Price',
  'Qty',
  'String',
  'UtcTimeStamp',
])
