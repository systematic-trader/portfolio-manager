import {
  type GuardType,
  integer,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { AssetType } from '../derives/asset-type.ts'

export const AccountBenchmarkInstrument = props({
  BenchmarkInstrumentAssetType: AssetType,
  BenchmarkInstrumentUic: integer(),
})

export interface AccountBenchmarkInstrument extends GuardType<typeof AccountBenchmarkInstrument> {}
