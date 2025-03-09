import { enums, type GuardType } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const SuppressibleMessageIdValues = [
  /** Traders are responsible for understanding cash quantity details, which are provided on a best efforts basis only */
  'o10164',

  /** <h4>Cash Quantity Order Confirmation</h4>Orders that express size using a monetary value (cash quantity) are provided on a non-guaranteed basis. The system simulates the order by cancelling it once the specified amount is spent (for buy orders) or collected (for sell orders). In addition to the monetary value, the order uses a maximum size that is calculated using the Cash Quantity Estimate Factor, which you can modify in Presets */
  'o10223',

  /** This order will most likely trigger and fill immediately.\nAre you sure you want to submit this order? */
  'o403',

  /** You are about to submit a stop order. Please be aware of the various stop order types available and the risks associated with each one.\nAre you sure you want to submit this order? */
  'o10331',

  /** Cross side order warning */
  'o2137',

  /** Called Bond warning */
  'o10082',

  /** OSL Digital Securities LTD Crypto Order Warning */
  'o10332',

  /** Option Exercise at the Money warning */
  'o10333',

  /** Warns that order will be placed into current omnibus account instead of currently selected global account */
  'o10334',

  /** Mixed allocation order warning */
  'o2136',

  /** Serves internal Rapid Entry window */
  'o10335',

  /** Wars about risks with Market Orders */
  'o10151',

  /** Warns about risks associated with market orders for Crypto */
  'o10288',

  /** Warns about risks associated with stop orders once they become active */
  'o10152',

  /** Madatory price cap warning – your order may be capped by the broker */
  'o10153',

  /** Warns that instrument does not support trading in fractions outside regular trading hours */
  'o2165',

  /** “If your order is not immediately executable, our systems may, depending on market conditions, reject your order if its limit price is more than the allowed amount away from the reference price at that time. If this happens, you will not receive a fill. This is a control designed to ensure that we comply with our regulatory obligations to avoid submitting disruptive orders to the marketplace.\\nUse the Price Management Algo?” */
  'p12',

  /** You are submitting an order without market data. We strongly recommend against this as it may result in erroneous and unexpected trades. Are you sure you want to submit this order? */
  'o354',

  /** The following order \””BUY 650 AAPL NASDAQ.NMS\”” size exceeds the Size Limit of 500.\nAre you sure you want to submit this order? */
  'o383',

  /** The following order \””BUY 650 AAPL NASDAQ.NMS\”” value estimate of 124,995.00 USD exceeds \nthe Total Value Limit of 100,000 USD.\nAre you sure you want to submit this order? */
  'o451',

  /** The following order size modification exceeds the size modification limit */
  'o10138',

  /** The following order exceeds the price percentage limit */
  'o163',

  /** The following value exceeds the tick size limit */
  'o382',
] as const

export const SuppressibleMessageIds = enums(SuppressibleMessageIdValues)

export type SuppressibleMessageIds = GuardType<typeof SuppressibleMessageIds>
