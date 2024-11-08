import {
  array,
  type GuardType,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { OrderDurationType } from '../derives/order-duration-type.ts'
import { PlaceableOrderType } from '../derives/placeable-order-type.ts'

export type SupportedOrderTypeSetting = GuardType<typeof SupportedOrderTypeSetting>

export const SupportedOrderTypeSetting = props({
  DurationTypes: array(OrderDurationType),
  OrderType: PlaceableOrderType,
})
