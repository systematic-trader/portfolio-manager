import { number, props } from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { Currency3 } from '../derives/currency.ts'
import { FeeType } from './fee-type.ts'
import { OrderAction } from './order-action.ts'

export const TradingConditionExchangeFeeRule = props({
  Currency: Currency3,
  OrderAction: OrderAction,
  Type: FeeType,
  Value: number(),
})
