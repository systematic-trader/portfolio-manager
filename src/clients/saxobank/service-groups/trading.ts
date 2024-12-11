import type { ServiceGroupClient } from '../service-group-client/service-group-client.ts'
import { InfoPrices } from './trading/info-prices.ts'
import { IsAlive } from './trading/is-alive.ts'
import { Orders } from './trading/orders.ts'
import { Positions } from './trading/positions.ts'
import { Prices } from './trading/prices.ts'

export class Trading {
  readonly infoPrices: InfoPrices
  readonly isAlive: IsAlive
  readonly orders: Orders
  readonly positions: Positions
  readonly prices: Prices

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('trade')

    this.infoPrices = new InfoPrices({ client: serviceGroupClient })
    this.isAlive = new IsAlive({ client: serviceGroupClient })
    this.orders = new Orders({ client: serviceGroupClient })
    this.positions = new Positions({ client: serviceGroupClient })
    this.prices = new Prices({ client: serviceGroupClient })
  }
}
