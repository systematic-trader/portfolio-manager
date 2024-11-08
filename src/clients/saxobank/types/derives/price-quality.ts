import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export type PriceQuality = GuardType<typeof PriceQuality>

/**
 * This enumeration describes the reliability of the price.
 * This is for spot trading on FX Options where a price must be tradable in order for a spot trade to be accepted.
 * Price access is controlled by price feed subscriptions and lack of permission may lead to delayed (Indicative) or even complete absense of prices (NoAccess).
 */
export const PriceQuality = enums([
  /** This is valid price, but you cannot directly create a position on that price (normally shown as a yellow price) */
  'Indicative',

  /**
   * User does not have permission to the price feed.
   * While FX prices are normally free, access to other price feeds depends on application type, the partner's default price feeds and feed subscriptions held by the user.
   */
  'NoAccess',

  /** There is currently no access to the market on which the instrument is traded */
  'NoMarket',

  /** Price origin is unknown */
  'None',

  /** This is valid price, but the price is "old", so you the market may have moved significantly from the price */
  'OldIndicative',

  /** A price is currently not available, but it will be shortly */
  'Pending',

  /**
   * Directly tradable price.
   * If this price was received from the /Prices endpoint, as opposed to the /InfoPrices endpoint, the caller use it as the basis for making a trade, by posting to the /Positions endpoint ("TradeOnQuote").
   */
  'Tradable',
])
