import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { Cost } from './trading-conditions/cost.ts'

export class TradingConditions {
  readonly cost: Cost

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('v1/tradingconditions')

    this.cost = new Cost({ client: serviceGroupClient })
  }
}
