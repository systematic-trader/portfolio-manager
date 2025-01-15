import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const CancelOrdersByInstrumentErrorCode = enums([
  /** An active trade follower is not allowed to cancel order manually */
  'ActiveFollowerCannotCancelOrderManually',

  /** Request to Cancel or Replace order already send */
  'AlreadyPendingCancelReplace',

  /** Broker Option */
  'BrokerOption',

  /** Cannot change order – part of an allocation */
  'ClientCannotChangeAllocatedOrder',

  /** Could not complete request */
  'CouldNotCompleteRequest',

  /** Force Open is not allowed */
  'ForceOpenNotAllowed',

  /** Illegal Account */
  'IllegalAccount',

  /** Invalid request */
  'InvalidRequest',

  /** Order cannot be canceled at this time */
  'OrderCannotBeCancelledAtThisTime',

  /** Requested order id not found */
  'OrderNotFound',

  /** OtherError */
  'OtherError',

  /** Too late to cancel order */
  'TooLateToCancelOrder',

  /** Not documented */
  'IllegalInstrumentId',
])

export type CancelOrdersByInstrumentErrorCode = GuardType<typeof CancelOrdersByInstrumentErrorCode>
