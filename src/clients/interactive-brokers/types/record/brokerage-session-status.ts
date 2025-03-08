import {
  boolean,
  type GuardType,
  literal,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { ServerInfo } from './server-info.ts'

export const BrokerageSessionStatus = props({
  authenticated: boolean(),
  competing: boolean(),
  connected: boolean(),
  message: string(),
  MAC: string(),
  serverInfo: ServerInfo,
  hardware_info: string(),
  fail: literal(''),
})

export interface BrokerageSessionStatus extends GuardType<typeof BrokerageSessionStatus> {}
