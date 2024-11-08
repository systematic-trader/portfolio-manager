import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type ContractOptionsTradingProfile = GuardType<typeof ContractOptionsTradingProfile>

export const ContractOptionsTradingProfile = enums([
  /** Can perform complex strategies */
  'Advanced',

  /** Can perform basic options trading such as buying calls and puts */
  'Basic',

  /** Can perform all types of options trades and strategies */
  'Expert',

  /** Not configured for options trading */
  'None',
])
