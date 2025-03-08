import {
  array,
  boolean,
  type GuardType,
  integer,
  never,
  props,
  record,
  string,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetClass } from '../derived/asset-class.ts'
import { ChartPeriod } from '../derived/chart-period.ts'
import { ServerInfo } from './server-info.ts'

export const Accounts = props({
  accounts: array(string(), { length: { minimum: 1 } }),
  acctProps: record(
    string(),
    props({
      hasChildAccounts: boolean(),
      supportsCashQty: boolean(),
      supportsFractions: boolean(),
      allowCustomerTime: boolean(),
      liteUnderPro: boolean(),
      noFXConv: boolean(),
      isProp: boolean(),
    }),
  ),
  aliases: record(string(), string()),
  allowFeatures: props({
    showGFIS: boolean(),
    showEUCostReport: boolean(),
    allowEventContract: boolean(),
    allowFXConv: boolean(),
    allowFinancialLens: boolean(),
    allowMTA: boolean(),
    allowTypeAhead: boolean(),
    allowEventTrading: boolean(),
    snapshotRefreshTimeout: integer({ minimum: 0 }),
    liteUser: boolean(),
    showWebNews: boolean(),
    research: boolean(),
    debugPnl: boolean(),
    showTaxOpt: boolean(),
    showImpactDashboard: boolean(),
    allowDynAccount: boolean(),
    allowCrypto: boolean(),
    allowedAssetTypes: string(),
    allowFA: boolean(),
    allowLiteUnderPro: boolean(),
    restrictTradeSubscription: boolean(),
  }),
  chartPeriods: record(AssetClass, array(ChartPeriod)),
  groups: array(never(), { length: 0 }),
  profiles: array(never(), { length: 0 }),
  selectedAccount: string(),
  serverInfo: ServerInfo,
  sessionId: string(),
  isFT: boolean(),
  isPaper: boolean(),
})

export type Accounts = GuardType<typeof Accounts>
