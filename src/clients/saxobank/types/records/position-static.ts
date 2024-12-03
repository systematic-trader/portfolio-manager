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
import { AssetType } from '../derives/asset-type.ts'
import { CorrelationType } from '../derives/correlation-type.ts'
import { PositionStatus } from '../derives/position-status.ts'
import { ToOpenClose } from '../derives/to-open-close.ts'
import { FixedIncomeData } from './fixed-income-data.ts'
import { OptionsData } from './options-data.ts'
import { RelatedOrderInfo } from './related-order-info.ts'

export interface PositionStatic extends GuardType<typeof PositionStatic> {}

export const PositionStatic = props({
  /** The id of the account to which the position belongs */
  AccountId: string(),

  /** Unique key of the account where the position is placed */
  AccountKey: string(),

  /** Allocation Key */
  AllocationKeyId: optional(string()),

  /** Sum volume of positions in instrument */
  Amount: number(),

  /** The AssetType */
  AssetType: AssetType,

  /** Indicates if the position may be closed */
  CanBeClosed: boolean(),

  /** The id of the client to which the position belongs */
  ClientId: string(),

  /**
   * True when the closing trades currency conversion rate has been settled
   * (i.e. is fixed and not fluctuating). This is the case for accounts using Market Conversion-Rates.
   */
  CloseConversionRateSettled: boolean(),

  /** The position's options board contract. Only applicable if the position was registered as originating from the options board */
  ContractId: optional(integer()),

  /** The id of the position that this position was copied from, if applicable */
  CopiedPositionId: optional(string()),

  /** Correlation key */
  CorrelationKey: string(),

  /** Type of the correlation */
  CorrelationTypes: optional(CorrelationType),

  /** The UTC date and time the position was closed */
  ExecutionTimeClose: optional(string({ format: 'date-iso8601' })),

  /** The UTC date and time the position was opened */
  ExecutionTimeOpen: string({ format: 'date-iso8601' }),

  /** The ExpiryDate */
  ExpiryDate: optional(string({ format: 'date-iso8601' })),

  /** Gets or sets the Client order reference id */
  ExternalReference: optional(string()),

  /** Information related to fixed income products */
  FixedIncomeData: optional(FixedIncomeData),

  /** If True, the position will not automatically be netted with position in the opposite direction */
  IsForceOpen: boolean(),

  /** True if the instrument is currently tradable on its exchange */
  IsMarketOpen: boolean(),

  /** Indicates whether the position is currently locked by back office */
  LockedByBackOffice: boolean(),

  /** Futures only - The date on which the owner may be required to take physical delivery of the instrument commodity */
  NoticeDate: optional(string({ format: 'date-iso8601' })),

  /** Open IndexRatio, Applicable for Inflation linked bonds */
  OpenIndexRatio: optional(number()),

  /** The price the instrument was traded at */
  OpenPrice: number(),

  /** The price the instrument was traded, with trading costs added */
  OpenPriceIncludingCosts: number(),

  /** Specifies the swap component of an FX forward price */
  OpenSwap: optional(number()),

  /** Details for options, warrants and structured products */
  OptionsData: optional(OptionsData),

  /** The ID of originating AlgoOrderStrategy */
  OriginatingAlgoOrderStrategyId: optional(string()),

  /** List of information about related open orders */
  RelatedOpenOrders: optional(array(RelatedOrderInfo)),

  /** Id of possible related position */
  RelatedPositionId: optional(string()),

  /** Unique id of the source order */
  SourceOrderId: optional(string()),

  /** The date on which settlement is to occur for an Fx spot transaction */
  SpotDate: optional(string()), // e.g. 2021-05-21T00:00:00

  /** SRD Last Trade Date */
  SrdLastTradeDate: optional(string({ format: 'date-iso8601' })),

  /** SRD Settlement Date */
  SrdSettlementDate: optional(string({ format: 'date-iso8601' })),

  /**
   * The status of the position.
   * Possible values: Open, Closed, Closing, PartiallyClosed, Locked.
   */
  Status: PositionStatus,

  /** Associated trade strategy id */
  StrategyId: optional(string()),

  /** Whether the position was opened in order to open/increase or close/decrease a position */
  ToOpenClose: optional(ToOpenClose),

  /** Unique id of the instrument */
  Uic: integer(),

  /** The value date of the position */
  ValueDate: string({ format: 'date-iso8601' }),
})
