import type { ServiceGroupClient } from '../service-group-client/service-group-client.ts'
import { CashManagement } from './client-services/cash-management.ts'
import { IsAlive } from './client-services/is-alive.ts'
import { TradingConditions } from './client-services/trading-conditions.ts'

export class ClientServices {
  readonly cashManagement: CashManagement
  readonly isAlive: IsAlive
  readonly tradingConditions: TradingConditions

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('cs')

    this.cashManagement = new CashManagement({ client: serviceGroupClient })
    this.isAlive = new IsAlive({ client: serviceGroupClient })
    this.tradingConditions = new TradingConditions({ client: serviceGroupClient })
  }
}
