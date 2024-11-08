import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type TradingErrorCode = GuardType<typeof TradingErrorCode>

export const TradingErrorCode = enums([
  /** Account is trade restricted */
  'AccountIsTradeRestricted',

  /** An active trade follower is not allowed to cancel order manually */
  'ActiveFollowerCannotCancelOrderManually',

  /** One or more mandatory parameters are missing */
  'AlgoOrderErrorInParameterValue',

  /** The assettype is not supported by the strategy */
  'AlgoOrderIllegalAssetType',

  /** The order duration type is not supported by the strategy */
  'AlgoOrderIllegalDurationType',

  /** One or more mandatory parameters are missing */
  'AlgoOrderMissingMandatoryParameter',

  /** Allocation key not found */
  'AllocationKeyNotFound',

  /** Participation with Percentage distribution type should sum up to 100% */
  'AllocationKeyPercentDoesNotSumToOneHundred',

  /** Request to Cancel or Replace order already send */
  'AlreadyPendingCancelReplace',

  /** The supplied duration is not supported for the current order */
  'AmountBelowMinimumLotSize',

  /** Amount differs from amount on related order */
  'AmountDiffersFromAmountOnRelatedOrder',

  /** Order or trade placed or changed to amount lower than sum of units in allocation key */
  'AmountLowerThanAllocationKeyUnits',

  /** Order size is not valid for the exchange */
  'AmountNotInLotSize',

  /** Barrier is too close to spot */
  'BarrierTooCloseToSpot',

  /** Request rejected by broker */
  'BrokerOption',

  /** Client cannot cancel Market Expiry Order */
  'ClientCannotCancelMarketExpiryOrder',

  /** Trade would exceed client exposure limitation */
  'ClientExposureLimitation',

  /** Error code return when commission rule is missing */
  'ClmDataFeedClientExceptionCommissionRuleMissing',

  /**
   * The specified closeAll key covers positions already closed by a closeAll key.
   */
  'CloseAllPositionsAlreadyBeingClosed',

  /** Instrument invalid for Direct Access trading */
  'DirectAccessNotAllowed',

  /** The supplied duration is not supported for the current order */
  'DurationNotSupported',

  /** Time and sales is not supported for this exchange */
  'ExchangeNotSupported',

  /** Exchange rate not available */
  'ExchangeRateNotAvailable',

  /**
   * Error code when expiration date is not set on order request having order duration: GoodTillDate.
   */
  'ExpirationDateInPast',

  /**
   * Error code when expiration date in the past on order request having order duration: GoodTillDate.
   */
  'ExpirationDateRequired',

  /** Error code when forward date is in the past on FxForwards order request */
  'ForwardDateInPast',

  /** Error code when forward date is not set on FxForwards order */
  'ForwardDateRequired',

  /** Error code when near leg and far leg value dates are not set on FxSwap order */
  'FxSwapLegsValueDateRequired',

  /** Account not allowed */
  'IllegalAccount',

  /** Illegal amount */
  'IllegalAmount',

  /** Illegal Date */
  'IllegalDate',

  /** Instrument cannot be found */
  'IllegalInstrumentId',

  /** Illegal strike price */
  'IllegalStrike',

  /** Error code returned when the watch list cannot be found */
  'IllegalWatchlistId',

  /** Trading is disabled for the instrument */
  'InstrumentDisabledForTrading',

  /** Instrument has expired */
  'InstrumentHasExpired',

  /** Error code returned when the account is not allowed to trade in or receive prices for the specified asset type */
  'InstrumentNotAllowed',

  /** Instrument not found or not allowed for market trades subscription */
  'InstrumentNotFoundOrNotAllowedForMarketTrades',

  /** The instrument is not tradable as the selected asset type */
  'InstrumentNotTradableAsTheSelectedType',

  /** Trading in instrument is suspended */
  'InstrumentSuspended',

  /** Unsupported instrument type */
  'InstrumentTypeNotSupportedException',

  /** Insufficient cash for trade */
  'InsufficentCash',

  /** Indicates that an operation cannot be performed because the resource requires a higher TradeLevel that the current session has. */
  'InsufficientTradeLevelException',

  /** Internal Server Error */
  'InternalServerError',

  /** Order or trade placed with an allocationkey thats invalid or marked as inactive or deleted */
  'InvalidAllocationKeyUsed',

  /** Invalid currency pair */
  'InvalidCurrencyPair',

  /** Error code when expiration date is not set on order request having order duration: GoodTillDate */
  'InvalidExpiryTimeOnExchange',

  /** Error code when near leg value date is greater than far leg value date */
  'InvalidFxSwapLegsValueDate',

  /** The provided message id is either invalid or not found */
  'InvalidMessageId',

  /** Invalid option root id specified */
  'InvalidOptionRootId',

  /** Error code returned when an invalid price request is submitted */
  'InvalidPriceRequest',

  /** Invalid refresh rate */
  'InvalidRefreshRate',

  /** Invalid request */
  'InvalidRequest',

  /**
   * Error code when expiration date is not set on order request having order duration: GoodTillDate.
   */
  'InvalidTimeInExpiationDateTime',

  /** Invalid TraderId - The TraderId does not conform to the formatting rules for TraderIds */
  'InvalidTraderId',

  /** Error code returned when the UIC is either invalid or not specified */
  'InvalidUic',

  /** Trade would result in borderline margin */
  'MarginBorderline',

  /** Market is closed */
  'MarketClosed',

  /** Error code when expiration date is not set on order request having order duration: GoodTillDate */
  'MissingTimeInExpirationDateTime',

  /** No chat message entered */
  'NoChatMessageEntered',

  /** No data access to instrument prices */
  'NoDataAccess',

  /** Not tradable at present */
  'NotTradableAtPresent',

  /** No valid quote to buy or sell on */
  'NoValidQuote',

  /** Order price is on wrong side of market */
  'OnWrongSideOfMarket',

  /** Opening short FX option positions is not allowed */
  'OpeningShortFXOptionPositionsNotAllowed',

  /** Exercise not allowed after exercise cut-off time or on last trading day or later */
  'OptionExerciseAfterCutoff',

  /** Error code when OptionsChain subscriptions are not supported for the given AssetType */
  'OptionsChainNotSupportedForAssetType',

  /** Order cannot be canceled at this time */
  'OrderCannotBeCancelledAtThisTime',

  /** Requested order id not found */
  'OrderNotFound',

  /** Order not placed */
  'OrderNotPlaced',

  /** The related position was not found or the current order is on a different account than the position */
  'OrderRelatedPositionMissMatch',

  /** The instruments's last trading date has passed */
  'OrderRequestAfterLastTradingDate',

  /** Order value is too large */
  'OrderValueTooLarge',

  /** Order value must be above the minimum order value for this exchange */
  'OrderValueToSmall',

  /** Limit of pending trade requests is exceeded */
  'PendingTradeRequests',

  /** A trade or order was placed with position buildup on an instrument not supporting this */
  'PositionBuildupNotValidForInstrument',

  /** The price exceeds the aggressive tolerance */
  'PriceExceedsAggressiveTolerance',

  /** Price from client trade request was not found in price history */
  'PriceNotFound',

  /** The price is not in valid ticksize increments */
  'PriceNotInTickSizeIncrements',

  /** Error code returned price request requires expiry date */
  'PriceRequestRequiresExpiryDate',

  /** Error code returned price request requires setting put or call */
  'PriceRequestRequiresPutCall',

  /** Quote has timed out */
  'QuoteHasTimedOut',

  /** Order request rejected due to failure for related order */
  'RelatedOrderWasRejected',

  /** Price subscription cannot enter Request For Quote */
  'RequestForQuoteFailed',

  /** Request For Quote is not allowed for an existing price subscription */
  'RequestForQuoteNotAllowed',

  /** Price subscription cannot add margin impact */
  'RequestMarginImpactOnNextPriceFailed',

  /** Price has changed to much, requote required */
  'RequoteRequired',

  /** Trading Short for selected instrument disabled */
  'ShortTradeDisabled',

  /** Contingent guaranteed stop price is too close to entry order price */
  'TooCloseToEntryOrder',

  /** Guaranteed stop is too close to market */
  'TooCloseToMarket',

  /** Order price is too close to OCO related order price */
  'TooCloseToOcoRelatedOrderPrice',

  /** Order price is too far from the entry order */
  'TooFarFromEntryOrder',

  /** Limit price is too far from market */
  'TooFarFromMarket',

  /** Too late to cancel order */
  'TooLateToCancelOrder',

  /** Error code when too many strikes are quested for one options-chain */
  'TooManyStrikesRequested',

  /** Trade contract size is to small */
  'TooSmallTrade',

  /** The TraderId is required for this application */
  'TraderIdIsRequired',

  /** Error code return when a position cannot be created, updated or exercised, because the session is not the primary trade session */
  'TradeSessionNotPrimary',

  /** Info price uic list is not distinct */
  'UicsInListNotUnique',

  /** Error code when expiration date is not set on order request having order duration: GoodTillDate */
  'UnexpectedTimeInExpirationDateTime',

  /** Unknown or no error code */
  'Unknown',

  /**
   * Returned when a price request is for a an amount that is larger than will be automatically accepted.
   * For IOC orders, this means that an order on that amount will always be rejected.
   */
  'WarningAmountLargeOrderSize',

  /** Would exceed equity concentration limit */
  'WouldExceedEquityConcentrationLimit',

  /** Trade would exceed margin limits */
  'WouldExceedMargin',

  /** Would exceed margin ceiling */
  'WouldExceedMarginCeiling',

  /** Trade would exceed trading line limits */
  'WouldExceedTradingLine',
])
