import { enums } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const ExchangeSessionState = enums([
  /**
   * Participants place orders to buy or sell units at certain buying or selling prices.
   * Orders collected during an auction are matched to form a contract.
   */
  'Auction',

  /** Normal trading */
  'AutomatedTrading',

  /** Break in exchange opening hours */
  'Break',

  /**
   * Participants place orders to buy or sell units at certain buying or selling prices.
   * Orders collected during an auction are matched to form a contract.
   */
  'CallAuctionTrading',

  /** Exchange is closed */
  'Closed',

  /** Trading is halted on the Exchange */
  'Halt',

  /** Opening auction exchange state */
  'OpeningAuction',

  /** Transactions are conducted in trading pits on the floor of the Exchange */
  'PitTrading',

  /** Extended trading session after normal opening hours */
  'PostAutomatedTrading',

  /** Extended trading session after normal opening hours */
  'PostMarket',

  /** Extended trading session after normal opening hours */
  'PostTrading',

  /** Extended trading session before normal opening hours */
  'PreAutomatedTrading',

  /** Extended trading session before normal opening hours */
  'PreMarket',

  /** Extended trading session before normal opening hours */
  'PreTrading',

  /** Trading is suspended on the Exchange */
  'Suspended',

  /** Orders collected at last price in absence of closing auction price */
  'TradingAtLast',
])
