import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { Cost } from './trading-conditions/cost.ts'
import { Instrument } from './trading-conditions/instrument.ts'

export class TradingConditions {
  readonly cost: Cost
  readonly instrument: Instrument

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('v1/tradingconditions')

    this.cost = new Cost({ client: serviceGroupClient })
    this.instrument = new Instrument({ client: serviceGroupClient })
  }
}
