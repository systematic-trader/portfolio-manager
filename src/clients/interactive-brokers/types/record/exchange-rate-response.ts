import {
  type GuardType,
  number,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const ExchangeRateResponse = props({
  rate: number(),
})

export interface ExchangeRateResponse extends GuardType<typeof ExchangeRateResponse> {}
