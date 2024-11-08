import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type CostAssumption = GuardType<typeof CostAssumption>

export const CostAssumption = enums([
  /** Atm Strike price is used */
  'AtmStrikePrice',

  /** Basis on Last close price */
  'BasisOnLastClosePrice',

  /** Basis on Mid price */
  'BasisOnMidPrice',

  /** Carrying cost estimation is based on 'Margin ex. OTM discount' */
  'CarryingCostBasedOnMarginOtmDiscount',

  /** Conversion cost not included */
  'ConversionCostNotIncluded',

  /** Default Call option */
  'DefaultCallOption',

  /** Open and Closed price are same */
  'EquivalentOpenAndClosePrice',

  /** The implicit costs not charged on account */
  'ImplicitCostsNotChargedOnAccount',

  /** Includes open and close cost */
  'IncludesOpenAndCloseCost',

  /** Interbank Interest rate = 0, only the markup is included */
  'InterbankChargesExcluded',

  /** Interest estimation is calculated from the value date of trade date + 2 days */
  'InterestEstimationCalculatedOnValueDate',

  /**
   * Applicable for orders placed on the platform.
   * Additional Manual Order Fees may apply for orders placed over the phone, chat or email.
   */
  'ManualOrderFeeMayApply',

  /**
   * The margin loan is estimated based on a snapshot based of your current Cash available
   * to partially or fully cover the value of position.
   */
  'MarginLoanEstimationOnCashAvailable',

  /** Near date is spot, far date is as specified */
  'NearDateSpotFarDateAsSpecified',
])
