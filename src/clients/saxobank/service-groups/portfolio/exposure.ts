import type { ServiceGroupClient } from '../../service-group-client/service-group-client.ts'
import { Currency } from './exposure/currency.ts'
import { FXSpot } from './exposure/fx-spot.ts'
import { Instruments } from './exposure/instruments.ts'

export class Exposure {
  readonly currency: Currency
  readonly fxSpot: FXSpot
  readonly instruments: Instruments

  constructor({ client }: { readonly client: ServiceGroupClient }) {
    const serviceGroupClient = client.appendPath('v1/exposure')

    this.currency = new Currency({ client: serviceGroupClient })
    this.fxSpot = new FXSpot({ client: serviceGroupClient })
    this.instruments = new Instruments({ client: serviceGroupClient })
  }
}
