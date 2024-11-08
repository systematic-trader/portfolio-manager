import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type ErrorCode = GuardType<typeof ErrorCode>

export const ErrorCode = enums([
  /** Dealer cancels quote */
  'DealerCancelsQuote',

  /** Dealer can not give quote at this time */
  'DealerCannotQuote',

  /** Dealer can not trade at this time */
  'DealerCannotTrade',

  /** Dealer disconnected */
  'DealerDisconnected',

  /** Dealer is handling other request for client */
  'DealerIsBusy',

  /** Dealer is not available */
  'DealerIsUnavailable',

  /** Dealer rejects quote request */
  'DealerRejectsQuoteRequest',

  /** No error code */
  'None',

  /** Quote has timed out */
  'QuoteHasTimedOut',

  /** Trade contract size is too small */
  'TooSmallTrade',

  /**
   * Returned when a price request is for an amount that is larger than will be automatically accepted.
   * For IOC orders, this means that an order on that amount will always be rejected.
   */
  'WarningAmountLargeOrderSize',

  /** Returned when an amount for an FXO is so small that we do not accept request for quotes on it */
  'WarningAmountTooSmall',
])
