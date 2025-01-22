import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const OrderAction = enums([
  /** On execution of algorithmic order */
  'AlgorithmicOrder',

  /** EtoAll */
  'EtoAll',

  /** EtoAssign */
  'EtoAssign',

  /** EtoDelivery */
  'EtoDelivery',

  /** EtoExercise */
  'EtoExercise',

  /** EtoExpiry */
  'EtoExpiry',

  /** On execute order */
  'ExecuteOrder',

  /** SRD rollover fee */
  'SRDRollover',
])

export type OrderAction = GuardType<typeof OrderAction>
