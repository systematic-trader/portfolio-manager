import {
  boolean,
  type GuardType,
  literal,
  nullable,
  props,
  string,
  unknown,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const BrokerageSessionStatus = props({
  authenticated: boolean(),
  competing: boolean(),
  connected: boolean(),
  message: string(),
  MAC: string(),
  serverInfo: props({
    serverName: nullable(unknown()),
    serverVersion: nullable(unknown()),
  }),
  hardware_info: string(),
  fail: literal(''),
})

export interface BrokerageSessionStatus extends GuardType<typeof BrokerageSessionStatus> {}
