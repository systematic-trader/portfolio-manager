import {
  type GuardType,
  nullable,
  props,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'

export const ServerInfo = props({
  serverName: nullable(string()),
  serverVersion: nullable(string()),
})

export interface ServerInfo extends GuardType<typeof ServerInfo> {}
