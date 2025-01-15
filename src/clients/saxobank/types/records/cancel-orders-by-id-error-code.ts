import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const CancelOrdersByIdErrorCode = enums([
  /** An active trade follower is not allowed to cancel order manually */
  'ActiveFollowerCannotCancelOrderManually',

  /** Request to Cancel or Replace order already send */
  'AlreadyPendingCancelReplace',

  /** Broker Option */
  'BrokerOption',

  /** Client can not cancel a market stop-out order */
  'ClientCannotCancelStopOutOrder',

  /** Cannot change order – part of an allocation */
  'ClientCannotChangeAllocatedOrder',

  /** Client is not enabled for trading in extended trading hours */
  'ClientNotEnabledForExtendedTradingHours',

  /** Could not complete request */
  'CouldNotCompleteRequest',

  /** Value of Extended trading hours cannot be changed */
  'ExtendedHoursTradingCannotBeChanged',

  /** Force Open is not allowed */
  'ForceOpenNotAllowed',

  /** Illegal Account */
  'IllegalAccount',

  /** If Extended trading hours is not configured for given instrument */
  'InstrumentNotSupportedForExtendedHours',

  /** One or more properties of the request are invalid! */
  'InvalidModelState',

  /** Invalid request */
  'InvalidRequest',

  /** In case of extended hours order, the OrderType must be limit */
  'OnlyLimitOrderAllowedForExtendedHours',

  /** Order cannot be canceled at this time */
  'OrderCannotBeCancelledAtThisTime',

  /** Your order request is pending broker confirmation. Confirmation is still possible */
  'OrderCommandPending',

  /** Your order request timed out. Please try again */
  'OrderCommandTimeout',

  /** Requested order id not found */
  'OrderNotFound',

  /** OtherError */
  'OtherError',

  /** Too late to cancel order */
  'TooLateToCancelOrder',
])

export type CancelOrdersByIdErrorCode = GuardType<typeof CancelOrdersByIdErrorCode>
