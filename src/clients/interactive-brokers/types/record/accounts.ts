import {
  array,
  boolean,
  type GuardType,
  integer,
  optional,
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
      allowCustomerTime: boolean(),
      autoFx: optional(boolean()),
      hasChildAccounts: boolean(),
      isProp: boolean(),
      liteUnderPro: boolean(),
      noFXConv: boolean(),
      supportsCashQty: boolean(),
      supportsFractions: boolean(),
    }),
  ),
  aliases: record(string(), string()),
  allowFeatures: props({
    allowCrypto: boolean(),
    allowDynAccount: boolean(),
    allowedAssetTypes: string(),
    allowEventContract: boolean(),
    allowEventTrading: boolean(),
    allowFA: boolean(),
    allowFinancialLens: boolean(),
    allowFXConv: boolean(),
    allowLiteUnderPro: boolean(),
    allowMTA: boolean(),
    allowTypeAhead: boolean(),
    debugPnl: boolean(),
    liteUser: boolean(),
    research: boolean(),
    restrictTradeSubscription: boolean(),
    showEUCostReport: boolean(),
    showGFIS: boolean(),
    showImpactDashboard: boolean(),
    showTaxOpt: boolean(),
    showUkUserLabels: boolean(),
    showWebNews: boolean(),
    sideBySide: boolean(),
    snapshotRefreshTimeout: integer({ minimum: 0 }),
  }),
  chartPeriods: record(AssetClass, array(ChartPeriod)),
  // groups: optional(literal(undefined)),
  isFT: boolean(),
  isPaper: boolean(),
  // profiles: optional(literal(undefined)),
  selectedAccount: string(),
  serverInfo: ServerInfo,
  sessionId: string(),
})

export type Accounts = GuardType<typeof Accounts>
