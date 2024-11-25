import type { ServiceGroupClient } from '../service-group-client/service-group-client.ts'
import { Charts } from './chart/charts.ts'
import { IsAlive } from './chart/is-alive.ts'

export class Chart {
  readonly isAlive: IsAlive
  readonly charts: Charts

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('chart')

    this.isAlive = new IsAlive({ client: serviceGroupClient })
    this.charts = new Charts({ client: serviceGroupClient })
  }
}
