import {
  array,
  type GuardType,
  number,
  props,
} from 'https://raw.githubusercontent.com/systematic-trader/type-guard/main/mod.ts'
import { MarginOverviewGroupType } from '../derives/margin-overview-group-type.ts'
import { MarginOverviewContributor } from './margin-overview-contributor.ts'

export interface MarginOverviewGroup extends GuardType<typeof MarginOverviewGroup> {}

export const MarginOverviewGroup = props({
  /** Contributors are either a list of instruments or a single (anonymous) object representing implicitly aggregated contributors */
  Contributors: array(MarginOverviewContributor),

  /** AssetType group - used by margin calculation */
  GroupType: MarginOverviewGroupType,

  /** Total margin impact of the group of instrument */
  TotalMargin: number(),
})
