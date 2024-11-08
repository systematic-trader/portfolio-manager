import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type ManagementType = GuardType<typeof ManagementType>

export const ManagementType = enums([
  /**
   * The account is managed by partner.
   * Client (beneficial owner of the account) cannot trade on this account but authorized dealers can.
   * However, client will get trade notifications.
   */
  'Advisory',

  /** The account is managed by the client (Default) */
  'Client',

  /**
   * The account is managed by partner.
   * Client (beneficial owner of the account) cannot trade on this account but authorized dealers can.
   * Client will not receive any trade notifications.
   */
  'Discretionary',

  /**
   * The account is managed externally (not in a saxo bank system).
   * Client cannot trade on the account, but authorized dealers can.
   */
  'ExternallyManaged',

  /** The account is managed by a model, but client has to accept changes to the model */
  'ModelAdvisory',

  /** The account is managed by a model. Client cannot trade on the account */
  'ModelManaged',

  /** Client can schedule periodic investments on one or multiple Instruments */
  'SelfPeriodicInvestment',

  /** Advisors can call clients with trade suggestions across products, but trades are accepted by the client */
  'TradeAdvisory',
])
