import {
  boolean,
  enums,
  type GuardType,
  number,
  optional,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface InstrumentPriceDetails extends GuardType<typeof InstrumentPriceDetails> {}

export const InstrumentPriceDetails = props({
  /**
   * Accrued Interest.
   * Valid for: Bonds
   */
  AccruedInterest: number(),

  /** AskYield are only valid for the bond asset type */
  AskYield: optional(number()),

  /** BidYield are only valid for the bond asset type */
  BidYield: optional(number()),

  /** Costs applicable to shorting the CFD */
  CfdBorrowingCost: number(),

  /** A rate relevant for certain long cfd positions */
  CfdHardToFinanceRate: number(),

  /**
   * Is returned as true when the instrument subscribed for is a CFD and the user is on a special mark-up price configuration.
   * If true, the values in EstPriceBuy and EstPriceSell are relevant (but still only provided given a share price)
   */
  CfdPriceAdjustment: optional(boolean()),

  /**
   * Trade is routed to trading venue.
   * Trade on quote not allowed.
   */
  Dma: boolean(),

  /**
   * May be returned when the instrument subscribed for is a CFD on a stock and the user is set up to trade on the share price, but pay a markup on top.
   * In that case the EstPriceBuy is the markup paied for an eventual buy order.
   * Not relevant for info prices.
   *
   * Price values are depending on a subscription to a feed.
   * This can mean no data, delayed data or real time data dependent on the callers subscription setup.
   */
  EstPriceBuy: number(),

  /**
   * May be returned when the instrument subscribed for is a CFD and the user is set up to trade on the share price, but pay a markup on top.
   * In that case the EstPriceSell is the markup paied for an eventual sell order.
   * Not relevant for info prices.
   *
   * Price values are depending on a subscription to a feed.
   * This can mean no data, delayed data or real time data dependent on the callers subscription setup.
   */
  EstPriceSell: number(),

  /**
   * Expiry date for contract.
   * Valid for: CFD Futures, FxOptions
   */
  ExpiryDate: string({ format: 'date-iso8601' }),

  /**
   * The far leg value date.
   * Applicable for FxSwap
   */
  ForwardDateFarLeg: string({ format: 'date-iso8601' }),

  /**
   * The near leg value date.
   * Applicable for FxSwap
   */
  ForwardDateNearLeg: string({ format: 'date-iso8601' }),

  /** IndexRatio, Applicable for inflation linked bond */
  IndexRatio: optional(number()),

  /** Gets or sets a value indicating whether the market on which the instrument is traded is currently open */
  IsMarketOpen: boolean(),

  /**
   * Lower Barrier.
   * Valid for: FX One Touch, No TouchOptions and certian derivatives such as Turbos */
  LowerBarrier: number(),

  /** The mid forward price */
  MidForwardPrice: number(),

  /**
   * The post mid price.
   * Valid for: Fx Options
   */
  MidSpotPrice: number(),

  /** MidYield are only valid for the bond asset type */
  MidYield: optional(number()),

  /** Futures only - The date on which the owner may be required to take physical delivery of the instrument commodity */
  NoticeDate: optional(string({ format: 'gregorian-date' })),

  /** The number of currently open contracts (available for contract options and futures) */
  OpenInterest: number(),

  /** A rate representing the interest to be paid when holding a CFD short position overnight */
  PaidCfdInterest: number(),

  /** A rate representing the interest to be paid when holding a SRD short position overnight */
  PaidSrdInterest: number(),

  /** Premium date */
  PremiumDate: string({ format: 'date-iso8601' }),

  /** A rate representing the interest received when with holding a CFD long position overnight */
  ReceivedCfdInterest: number(),

  /** A rate representing the interest received when with holding a SRD long position overnight */
  ReceivedSrdInterest: number(),

  /** Set to true if short trading is disabled for this instrument */
  ShortTradeDisabled: boolean(),

  /**
   * The spot ask price.
   * Valid for: FX Forwards.
   */
  SpotAsk: number(),

  /**
   * The post bid price.
   * Valid for: Fx Forwards. */
  SpotBid: number(),

  /**
   * The Spot Date.
   * Valid for Fx Forwards. */
  SpotDate: string({ format: 'gregorian-date' }),

  /** Liquidation/Last Trade Date of the SRD */
  SrdLastTradeDate: string({ format: 'date-iso8601' }),

  /** Settlement Date of the SRD */
  SrdSettlementDate: string({ format: 'date-iso8601' }),

  /** Option Strike Price */
  StrikePrice: number(),

  /** Swap rate for ask, Valid for: FxForwards and FxSwap */
  SwapAsk: number(),

  /** Swap rate for bid, Valid for: FxForwards and FxSwap */
  SwapBid: number(),

  /**
   * Upper Barrier.
   * Valid for: FX One Touch, No TouchOptions and certian derivatives such as Turbos.
   */
  UpperBarrier: number(),

  /** Actual ValueDate (could be different from what was specified in request due to holidays etc.) */
  ValueDate: string({ format: 'gregorian-date' }),

  /** Not documented */
  AverageVolume30Days: number(),

  /** Not documented */
  AverageVolume: optional(number()),

  /** Not documented */
  RelativeVolume: optional(number()),

  /** Not documented */
  PriceFeedType: optional(enums(['Consolidated'])),

  /** Not documented */
  FarLegAsk: number(),

  /** Not documented */
  FarLegBid: number(),

  /** Not documented */
  FarLegMidPrice: number(),

  /** Not documented */
  NearLegMidPrice: number(),

  /** Not documented */
  AskPricePerContract: number(),

  /** Not documented */
  BidPricePerContract: number(),
})
