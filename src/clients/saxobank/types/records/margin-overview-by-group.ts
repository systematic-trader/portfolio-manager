import {
  array,
  type GuardType,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { MarginOverviewGroup } from './margin-overview-group.ts'

export interface MarginOverviewByGroup extends GuardType<typeof MarginOverviewByGroup> {}

export const MarginOverviewByGroup = props({
  /** List of AssetType groups with it's contributing positions and total margin utilization */
  Groups: array(MarginOverviewGroup),
})
