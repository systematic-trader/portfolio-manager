import {
  enums,
  type GuardType,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { BuySell } from '../derives/buy-sell.ts'
import { Currency3 } from '../derives/currency.ts'

const TaxCalculationType = enums([
  /** Tax is calculated as percentage of commission */
  'CommissionFraction',

  /** Tax is charged as fixed amount */
  'FixedAmount',

  /** Fraction of Fractional Trade Value. Uses the Fractional part of the Amount. */
  'FractionalTradeValueFraction',

  /** Transaction Cost/Tax applicable for CTax. */
  'FractionOfTransactionCostPerTransaction',

  /** Fraction of Integer Trade Value. Uses the Integer part of the Amount. */
  'IntegerTradeValueFraction',

  /** Tax is calculated as percentage of traded amount */
  'TradeAmountFraction',

  /** Tax is calculated as percentage of total value */
  'ValueFraction',

  /** Fraction Of Traded Value/Capital Gain Value plus the Fixed Amount. */
  'ValueFractionAndFixedCost',
])

export type TaxCalculationType = GuardType<typeof TaxCalculationType>

const TransactionTaxTypes = enums([
  /** Not documented */
  'Commission',

  /** CTax on commission. */
  'CTaxOnCommission',

  /** CTax on manual order fee. */
  'CTaxOnManualOrderFee',

  /** Not documented */
  'GSTOnCommission',

  /** Not documented */
  'HongKongStampDuty',

  /** Not documented */
  'ManualOrderFee',

  /** Not documented */
  'USSecClearingFee',
])

export type TransactionTaxTypes = GuardType<typeof TransactionTaxTypes>

export interface Tax extends GuardType<typeof Tax> {}

export const Tax = props({
  /** Fee in Percentage */
  Pct: number(),

  /** Fee Rule */
  Rule: props({
    /** To identify if tax is buy or sell */
    BuySell: optional(BuySell),

    /** Calculation type of applied tax */
    CalculationType: TaxCalculationType,

    /** Currency */
    Currency: optional(Currency3),

    /** Type of applicable tax */
    Description: string(),

    /** Markup */
    Markup: optional(number()),

    /** Percentage */
    Pct: optional(number()),

    /** The target transaction cost/tax applicable for Fraction Of Transaction Cost Per Transaction */
    TargetCostType: optional(TransactionTaxTypes),

    /** Value */
    Value: number(),
  }),

  /** Fee Value */
  Value: number(),
})
