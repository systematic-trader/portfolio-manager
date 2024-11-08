import {
  type GuardType,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export interface StringStringKeyValuePair extends GuardType<typeof StringStringKeyValuePair> {}

export const StringStringKeyValuePair = props({
  Key: string(),
  Value: string(),
})
