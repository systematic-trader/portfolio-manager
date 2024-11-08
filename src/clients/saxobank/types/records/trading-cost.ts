import {
  array,
  type GuardType,
  optional,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { BaseFee } from './base-fee.ts'
import { Commision } from './commision.ts'
import { CustodyFee } from './custody-fee.ts'
import { ServiceFee } from './service-fee.ts'
import { Spread } from './spread.ts'

export interface TradingCost extends GuardType<typeof TradingCost> {}

export const TradingCost = props({
  /** The commission structure for the selected instrument */
  Commissions: optional(array(Commision)),

  /** Currency Conversion Cost */
  ConversionCost: optional(BaseFee),

  /** Custody fee per year for holding cash positions */
  CustodyFee: optional(CustodyFee),

  /** Exchange fee if applied separately */
  ExchangeFee: optional(BaseFee),

  /** Service fee per year for holding cash positions */
  ServiceFee: optional(ServiceFee),

  /**
   * The spread used for fx forwards is indicative and depends on how far in the future the value date of the forward is.
   * The different time horizon is called tenors and this collection shows a current snapshot of the spreads for the different tenors.
   */
  Spread: optional(Spread),

  /**
   * A ticket fee is a charge for doing a trade.
   * Ticket fees are for fx (both spot and options).
   * A ticket fee is applied if below the TicketFeeThreshold.
   */
  TicketFee: optional(BaseFee),
})
