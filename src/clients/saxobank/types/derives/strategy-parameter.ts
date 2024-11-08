import {
  array,
  boolean,
  type GuardType,
  integer,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { StrategyParameterAllowedValue } from '../records/strategy-parameter-allowed-value.ts'
import { StrategyParameterDataType } from './strategy-parameter-data-type.ts'

export interface StrategyParameter extends GuardType<typeof StrategyParameter> {}

export const StrategyParameter = props({
  /** Parameter's type */
  DataType: StrategyParameterDataType,

  /** Parameter's description */
  Description: string(),

  /** Name to be displayed on the UI */
  DisplayName: string(),

  /** Indicates whether parameter value is editable */
  IsEditable: boolean(),

  /** Indicates whether parameter is mandatory */
  IsMandatory: boolean(),

  /** Max day time value */
  MaxDayTimeValue: optional(string()),

  /** Max float value */
  MaxFloatValue: optional(number()),

  /** Min day time value */
  MinDayTimeValue: optional(string()),

  /** Min float value */
  MinFloatValue: optional(number()),

  /** Name */
  Name: string(),

  /** Allowed parameter values */
  ParameterValues: optional(array(StrategyParameterAllowedValue)),

  /** UI default value */
  UiDefaultValue: optional(string()),

  /** Suggested ordering column */
  UiOrderingIndex: integer(),

  /** UI step size */
  UiStepSize: optional(number()),
})
